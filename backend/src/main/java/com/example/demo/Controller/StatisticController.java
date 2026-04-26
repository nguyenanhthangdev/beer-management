package com.example.demo.Controller;

import com.example.demo.Service.StatisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin("*")
public class StatisticController {

    @Autowired
    private StatisticService service;

    @GetMapping("/today")
    public Long today() {
        return service.revenueToday();
    }

    @GetMapping("/month")
    public Long month() {
        return service.revenueThisMonth();
    }

    @GetMapping("/day")
    public Long byDate(@RequestParam String date) {
        return service.revenueByDate(LocalDate.parse(date));
    }

    @GetMapping("/last-7-days")
    public List<Object[]> last7Days() {
        return service.last7Days();
    }

    @GetMapping("/best-seller")
    public List<Object[]> bestSeller() {
        return service.bestSeller();
    }

    @GetMapping("/least-seller")
    public List<Object[]> leastSeller() {
        return service.leastSeller();
    }

    @GetMapping("/compare/today")
    public Object[] compareToday() {
        return service.compareTodayVsYesterday();
    }

    @GetMapping("/compare/week")
    public Object[] compareWeek() {
        return service.compareWeek();
    }

    @GetMapping("/compare/month")
    public Object[] compareMonth() {
        return service.compareMonth();
    }

    @GetMapping("/low-seller")
    public Map<String, List<Object[]>> stats() {
        return service.getLowSeller();
    }

    @GetMapping("/zero-seller")
    public List<String> zeroSeller() {
        return service.getZeroSeller();
    }
}