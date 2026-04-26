package com.example.demo.Service;

import com.example.demo.Repository.OrderItemRepository;
import com.example.demo.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public Long revenueToday() {
        Long r = orderRepo.revenueToday();
        return r != null ? r : 0;
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

    public List<Object[]> last7Days() {
        return orderRepo.last7Days();
    }

    // ===== BEST / LEAST =====

    public List<Object[]> bestSeller() {
        return itemRepo.bestSeller();
    }

    public List<Object[]> leastSeller() {
        return itemRepo.leastSeller();
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

//    public List<Object[]> getLowSeller() {
//        return itemRepo.lowSeller();
//    }

    public Map<String, List<Object[]>> getLowSeller() {

        List<Object[]> all = itemRepo.bestSeller();

        // sort giảm dần theo số lượng
        all.sort((a, b) -> Long.compare((Long) b[1], (Long) a[1]));

        // ===== BEST SELLER =====
        List<Object[]> best = all.stream()
                .limit(5)
                .toList();

        Set<String> bestNames = best.stream()
                .map(i -> (String) i[0])
                .collect(Collectors.toSet());

        // ===== LEAST SELLER =====
        List<Object[]> least = all.stream()
                .filter(i -> {
                    String name = (String) i[0];
                    Long qty = (Long) i[1];

                    return qty > 0                      // ❌ loại món chưa bán
                            && !bestNames.contains(name); // ❌ loại best seller
                })
                .sorted(Comparator.comparing(i -> (Long) i[1])) // tăng dần
                .toList(); // 🔥 KHÔNG LIMIT

        Map<String, List<Object[]>> result = new HashMap<>();
        result.put("best", best);
        result.put("least", least);

        return result;
    }

    public List<String> getZeroSeller() {
        return itemRepo.zeroSeller();
    }

}
