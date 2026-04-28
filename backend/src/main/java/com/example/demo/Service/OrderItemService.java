package com.example.demo.Service;

import com.example.demo.Entity.OrderItem;
import com.example.demo.Entity.Orders;
import com.example.demo.Entity.Product;
import com.example.demo.Repository.OrderItemRepository;
import com.example.demo.Repository.OrderRepository;
import com.example.demo.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderItemService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private OrderItemRepository repo;

    public OrderItem addItem(OrderItem item) {

        Optional<OrderItem> existing =
                repo.findByOrderIdAndProductId(item.getOrderId(), item.getProductId());

        if (existing.isPresent()) {
            OrderItem old = existing.get();
            old.setQuantity(old.getQuantity() + item.getQuantity());
            return repo.save(old);
        }

        return repo.save(item);
    }

    public void deleteAll() {
        repo.deleteAll();
    }

    public List<OrderItem> getByOrder(Long orderId) {
        return repo.findByOrderId(orderId);
    }

    public double getTotal(Long orderId) {
        List<OrderItem> items = repo.findByOrderId(orderId);

        double total = 0;
        for (OrderItem item : items) {
            Optional<Product> optional = productRepo.findById(item.getProductId());

            if (optional.isPresent()) {
                Product p = optional.get();
                total += p.getPrice() * item.getQuantity();
            }

        }

        return total;
    }

    public List<OrderItem> getAll() {
        return repo.findAll();
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Không tìm thấy món để xóa");
        }
        repo.deleteById(id);
    }

    public void addItem(Long orderId, Long productId, int quantity) {
        Orders order = orderRepo.findById(orderId).orElseThrow();
        Product product = productRepo.findById(productId).orElseThrow();

        OrderItem item = new OrderItem();
        item.setOrderId(orderId);
        item.setProductId(productId);

        // 🔥 snapshot tại thời điểm bán
        item.setProductName(product.getName());
        item.setPrice(product.getPrice());

        item.setQuantity(quantity);

        repo.save(item);
    }

    public void updateServed(Long id, Boolean served) {
        OrderItem item = repo.findById(id).orElseThrow();
        item.setServed(served);
        repo.save(item);
    }
}