package com.example.demo.Controller;

import com.example.demo.Service.StatisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin("*")
public class StatisticController {

    @Autowired
    private StatisticService service;

    // theo ngày
    @GetMapping("/day")
    public Long byDay(@RequestParam String date) {
        return service.revenueByDate(LocalDate.parse(date));
    }

    // theo khoảng
    @GetMapping("/range")
    public Long byRange(@RequestParam String start, @RequestParam String end) {
        return service.revenueBetween(
                LocalDateTime.parse(start),
                LocalDateTime.parse(end)
        );
    }

    // best seller
    @GetMapping("/best-seller")
    public List<Object[]> bestSeller() {
        return service.bestSeller();
    }

    // least seller
    @GetMapping("/least-seller")
    public List<Object[]> leastSeller() {
        return service.leastSeller();
    }

    @GetMapping("/test")
    public String test() {
        return "OK";
    }
}