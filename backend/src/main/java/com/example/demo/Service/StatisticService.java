package com.example.demo.Service;

import com.example.demo.Repository.OrderItemRepository;
import com.example.demo.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StatisticService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private OrderItemRepository itemRepo;

    // theo ngày
    public Long revenueByDate(LocalDate date) {
        return orderRepo.getRevenueByDate(date);
    }

    // theo tuần / tháng
    public Long revenueBetween(LocalDateTime start, LocalDateTime end) {
        return orderRepo.getRevenueBetween(start, end);
    }

    // best seller
    public List<Object[]> bestSeller() {
        return itemRepo.getBestSeller();
    }

    // least seller
    public List<Object[]> leastSeller() {
        return itemRepo.getLeastSeller();
    }
}
