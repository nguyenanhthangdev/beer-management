package com.example.demo.Service;

import com.example.demo.Repository.OrderItemRepository;
import com.example.demo.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private OrderItemRepository itemRepo;

    // ===== DOANH THU =====

    public Long getTodayRevenue() {
        Long res = orderRepo.revenueToday();
        return res != null ? res : 0L;
    }

    public Long revenueThisMonth() {
        Long r = orderRepo.revenueThisMonth();
        return r != null ? r : 0;
    }

    public Long revenueByDate(LocalDate date) {
        Long r = orderRepo.revenueByDate(date.toString());
        return r != null ? r : 0;
    }

    // ===== 7 NGÀY =====

//    public List<Object[]> last7Days() {
//        return orderRepo.last7Days();
//    }

    public List<Object[]> last7Days() {
        List<Object[]> result = new ArrayList<>();

        try {
            List<Object[]> data = orderRepo.getLast7DaysRaw();

            Map<LocalDate, Long> map = new HashMap<>();

            for (Object[] row : data) {
                try {
                    Object timeObj = row[0];
                    Object amountObj = row[1];

                    LocalDate date;

                    if (timeObj instanceof LocalDateTime) {
                        date = ((LocalDateTime) timeObj).toLocalDate();
                    } else if (timeObj instanceof java.sql.Timestamp) {
                        date = ((Timestamp) timeObj).toLocalDateTime().toLocalDate();
                    } else {
                        continue;
                    }

                    Long amount = ((Number) amountObj).longValue();

                    map.put(date, map.getOrDefault(date, 0L) + amount);

                } catch (Exception e) {
                    System.out.println("ROW ERROR: " + Arrays.toString(row));
                }
            }

            LocalDate today = LocalDate.now();

            for (int i = 6; i >= 0; i--) {
                LocalDate d = today.minusDays(i);
                result.add(new Object[]{
                        d.toString(),
                        map.getOrDefault(d, 0L)
                });
            }

        } catch (Exception e) {
            e.printStackTrace(); // 👈 QUAN TRỌNG
        }

        return result;
    }

    // ===== BEST / LEAST =====

    public List<Object[]> bestSeller() {
        return itemRepo.bestSeller();
    }


    // ===== SO SÁNH =====

    public Object[] compareTodayVsYesterday() {
        return orderRepo.compareToday();
    }

    public Object[] compareToday() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        Long todayRevenue = orderRepo.sumByDate(today);
        Long yesterdayRevenue = orderRepo.sumByDate(yesterday);

        return new Object[]{todayRevenue, yesterdayRevenue};
    }

    public Object[] compareWeek() {
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime startThisWeek = now.minusDays(7);
        LocalDateTime startLastWeek = now.minusDays(14);

        Long thisWeek = orderRepo.sumBetween(startThisWeek, now);
        Long lastWeek = orderRepo.sumBetween(startLastWeek, startThisWeek);

        return new Object[]{thisWeek, lastWeek};
    }

    public Object[] compareMonth() {
        LocalDate now = LocalDate.now();

        LocalDate startThisMonth = now.withDayOfMonth(1);
        LocalDate startLastMonth = startThisMonth.minusMonths(1);

        Long thisMonth = orderRepo.sumBetween(
                startThisMonth.atStartOfDay(),
                now.atTime(23, 59)
        );

        Long lastMonth = orderRepo.sumBetween(
                startLastMonth.atStartOfDay(),
                startThisMonth.atStartOfDay()
        );

        return new Object[]{thisMonth, lastMonth};
    }

    public List<Object[]> getProductSales() {
        return itemRepo.bestSeller();
    }

    public List<String> getZeroSeller() {
        return itemRepo.zeroSeller();
    }

    public Double getRevenueByDate(LocalDate date) {
        Double result = orderRepo.getRevenueByDate(date);
        return result != null ? result : 0;
    }
}
