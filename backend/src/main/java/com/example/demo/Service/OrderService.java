package com.example.demo.Service;

import com.example.demo.Entity.OrderItem;
import com.example.demo.Entity.Orders;
import com.example.demo.Entity.TableEntity;
import com.example.demo.Repository.OrderItemRepository;
import com.example.demo.Repository.OrderRepository;
import com.example.demo.Repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository repo;

    @Autowired
    private TableRepository tableRepo;

    @Autowired
    private OrderItemRepository itemRepo;

    public List<Orders> getAll() {
        return repo.findAll();
    }

    public void deleteAll() {
        repo.deleteAll();
    }

    public Orders openOrder(Long tableId) {

        TableEntity table = tableRepo.findById(tableId).orElseThrow();

        // ✅ dùng USING (không phải BUSY)
        table.setStatus("USING");
        tableRepo.save(table);

        return repo.findByTableIdAndStatus(tableId, "OPEN")
                .orElseGet(() -> {
                    Orders o = new Orders();
                    o.setTableId(tableId);
                    o.setStatus("OPEN");
                    o.setCreatedAt(LocalDateTime.now());
                    return repo.save(o);
                });
    }

    public Orders closeOrder(Long orderId) {
        Orders order = repo.findById(orderId).orElseThrow();

        List<OrderItem> items = itemRepo.findByOrderId(orderId);

        Long total = items.stream()
                .mapToLong(i -> i.getPrice() * i.getQuantity())
                .sum();

        order.setTotalAmount(total);

        order.setStatus("PAID");
        order.setClosedAt(LocalDateTime.now());

        TableEntity table = tableRepo.findById(order.getTableId()).orElseThrow();

        // ✅ trả về EMPTY
        table.setStatus("EMPTY");
        tableRepo.save(table);

        return repo.save(order);
    }
}