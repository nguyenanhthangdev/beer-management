package com.example.demo.Controller;

import com.example.demo.Entity.OrderItem;
import com.example.demo.Service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    @Autowired
    private OrderItemService service;

    @Autowired
    private OrderItemService orderItemService;

//    @PostMapping
//    public OrderItem add(@RequestBody OrderItem item) {
//        return service.addItem(item);
//    }

    @GetMapping("/{orderId}")
    public List<OrderItem> get(@PathVariable Long orderId) {
        return service.getByOrder(orderId);
    }

    @GetMapping("/{orderId}/total")
    public double total(@PathVariable Long orderId) {
        return service.getTotal(orderId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        orderItemService.delete(id);
        return ResponseEntity.ok("Đã xóa thành công");
    }

    @DeleteMapping("/all")
    public void deleteAll() {
        service.deleteAll();
    }

    @PostMapping
    public void addItem(@RequestBody OrderItem item) {
        service.addItem(
                item.getOrderId(),
                item.getProductId(),
                item.getQuantity()
        );
    }

    @GetMapping
    public List<OrderItem> getAllItems() {
        return orderItemService.getAll();
    }

    @PutMapping("/{id}/served")
    public void updateServed(@PathVariable Long id, @RequestParam Boolean served) {
        service.updateServed(id, served);
    }
}