package com.example.demo.Repository;

import com.example.demo.Entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    Optional<Orders> findByTableIdAndStatus(Long tableId, String status);

    // ===== DOANH THU =====

    @Query(value = """
        SELECT COALESCE(SUM(o.total_amount), 0)
        FROM orders o
        WHERE o.closed_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
          AND o.closed_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') + INTERVAL '1 day'
          AND o.status = 'PAID'
    """, nativeQuery = true)
    Long revenueToday();

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Orders o
        WHERE o.status = 'PAID'
          AND EXTRACT(MONTH FROM o.closedAt) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM o.closedAt) = EXTRACT(YEAR FROM CURRENT_DATE)
    """)
    Long revenueThisMonth();

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Orders o
        WHERE o.status = 'PAID'
          AND DATE(o.closedAt) = :date
    """)
    Long revenueByDate(@Param("date") LocalDate date);

    // ===== 7 NGÀY =====
    @Query("""
        SELECT o.closedAt, o.totalAmount
        FROM Orders o
        WHERE o.status = 'PAID'
          AND o.closedAt IS NOT NULL
    """)
    List<Object[]> getLast7DaysRaw();

    @Query(value = """
        SELECT
          COALESCE((
            SELECT SUM(o.total_amount)
            FROM orders o
            WHERE DATE(o.closed_at) = CURRENT_DATE
              AND o.status = 'PAID'
          ), 0) AS today,
    
          COALESCE((
            SELECT SUM(o.total_amount)
            FROM orders o
            WHERE DATE(o.closed_at) = CURRENT_DATE - INTERVAL '1 day'
              AND o.status = 'PAID'
          ), 0) AS yesterday
    """, nativeQuery = true)
    List<Object[]> compareToday();

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Orders o
        WHERE o.status = 'PAID'
          AND DATE(o.closedAt) = :date
    """)
    Long sumByDate(@Param("date") LocalDate date);

    @Query("""
        SELECT SUM(o.totalAmount)
        FROM Orders o
        WHERE o.status = 'PAID'
          AND o.closedAt BETWEEN :start AND :end
    """)
    Long sumBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
        SELECT SUM(o.totalAmount)
        FROM Orders o
        WHERE o.status = 'PAID'
          AND DATE(o.closedAt) = :date
    """)
    Double getRevenueByDate(@Param("date") LocalDate date);
}
