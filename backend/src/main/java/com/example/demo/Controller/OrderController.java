package com.example.demo.Controller;

import com.example.demo.Entity.Orders;
import com.example.demo.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService service;

    @PostMapping("/open/{tableId}")
    public Orders open(@PathVariable Long tableId) {
        return service.openOrder(tableId);
    }

    @PostMapping("/close/{orderId}")
    public Orders close(@PathVariable Long orderId) {
        return service.closeOrder(orderId);
    }

    @GetMapping
    public List<Orders> getAllOrders() {
        return service.getAll();
    }
}