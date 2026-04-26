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

    @Query("""
    SELECT SUM(o.totalAmount)
    FROM Orders o
    WHERE o.status = 'PAID'
    AND o.closedAt BETWEEN :start AND :end
    """)
    Long getRevenueBetween(LocalDateTime start, LocalDateTime end);

    // ===== DOANH THU =====

    @Query(value = """
        SELECT COALESCE(SUM(o.total_amount), 0)
        FROM orders o
        WHERE o.closed_at >= CURRENT_DATE
          AND o.closed_at < DATEADD('DAY', 1, CURRENT_DATE)
          AND o.status = 'PAID'
    """, nativeQuery = true)
    Long revenueToday();

    @Query("SELECT SUM(o.totalAmount) FROM Orders o WHERE MONTH(o.closedAt) = MONTH(CURRENT_DATE) AND YEAR(o.closedAt) = YEAR(CURRENT_DATE) AND o.status = 'PAID'")
    Long revenueThisMonth();

    @Query("SELECT SUM(o.totalAmount) FROM Orders o WHERE DATE(o.closedAt) = :date AND o.status = 'PAID'")
    Long revenueByDate(String date);

    // ===== 7 NGÀY =====
    @Query(value = """
        SELECT DATE(o.closed_at), SUM(o.total_amount)
        FROM orders o
        WHERE o.closed_at >= CURDATE() - INTERVAL 7 DAY
          AND o.status = 'PAID'
        GROUP BY DATE(o.closed_at)
        ORDER BY DATE(o.closed_at)
    """, nativeQuery = true)
    List<Object[]> last7Days();

    // ===== SO SÁNH =====
    @Query(value = """
        SELECT
          (SELECT SUM(o.total_amount)
           FROM orders o
           WHERE DATE(o.closed_at) = CURDATE()
             AND o.status = 'PAID') AS today,

          (SELECT SUM(o.total_amount)
           FROM orders o
           WHERE DATE(o.closed_at) = CURDATE() - INTERVAL 1 DAY
             AND o.status = 'PAID') AS yesterday
    """, nativeQuery = true)
    Object[] compareToday();

    @Query("""
        SELECT SUM(o.totalAmount)
        FROM Orders o
        WHERE o.status = 'PAID'
          AND DATE(o.closedAt) = :date
    """)
    Long sumByDate(LocalDate date);

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
