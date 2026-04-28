package com.example.demo.Repository;

import com.example.demo.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    Optional<OrderItem> findByOrderIdAndProductId(Long orderId, Long productId);

    // ===== BEST SELLER =====
    @Query("""
        SELECT oi.productName, SUM(oi.quantity)
        FROM OrderItem oi
        JOIN Orders o ON oi.orderId = o.id
        WHERE o.status = 'PAID'
        GROUP BY oi.productName
    """)
    List<Object[]> bestSeller();

    // ===== Món ít mua =====
    @Query("""
        SELECT oi.productName, SUM(oi.quantity)
        FROM OrderItem oi
        JOIN Orders o ON oi.orderId = o.id
        WHERE o.status = 'PAID'
        GROUP BY oi.productName
    """)
    List<Object[]> getProductSales();

    // ===== Món chưa được mua lần nào =====
    @Query(value = """
        SELECT p.name
        FROM product p
        WHERE NOT EXISTS (
            SELECT 1
            FROM order_item oi
            INNER JOIN orders o ON o.id = oi.order_id
            WHERE o.status = 'PAID'
              AND oi.product_id = p.id
        )
    """, nativeQuery = true)
    List<String> zeroSeller();
}
