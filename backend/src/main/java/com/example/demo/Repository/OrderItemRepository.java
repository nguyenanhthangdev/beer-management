package com.example.demo.Repository;

import com.example.demo.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    Optional<OrderItem> findByOrderIdAndProductId(Long orderId, Long productId);

    @Query("""
    SELECT i.productName, SUM(i.quantity) as totalQty, SUM(i.quantity * i.price) as totalMoney
    FROM OrderItem i
    JOIN Orders o ON i.orderId = o.id
    WHERE o.status = 'PAID'
    GROUP BY i.productName
    ORDER BY totalQty DESC
    """)
    List<Object[]> getBestSeller();

    @Query("""
    SELECT i.productName, SUM(i.quantity)
    FROM OrderItem i
    JOIN Orders o ON i.orderId = o.id
    WHERE o.status = 'PAID'
    GROUP BY i.productName
    ORDER BY SUM(i.quantity) ASC
    """)
    List<Object[]> getLeastSeller();
}
