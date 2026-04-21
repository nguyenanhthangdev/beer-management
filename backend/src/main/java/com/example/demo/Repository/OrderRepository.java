package com.example.demo.Repository;

import com.example.demo.Entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    Optional<Orders> findByTableIdAndStatus(Long tableId, String status);

    @Query("""
    SELECT SUM(o.totalAmount)
    FROM Orders o
    WHERE o.status = 'PAID'
    AND DATE(o.closedAt) = :date
    """)
    Long getRevenueByDate(LocalDate date);

    @Query("""
    SELECT SUM(o.totalAmount)
    FROM Orders o
    WHERE o.status = 'PAID'
    AND o.closedAt BETWEEN :start AND :end
    """)
    Long getRevenueBetween(LocalDateTime start, LocalDateTime end);
}
