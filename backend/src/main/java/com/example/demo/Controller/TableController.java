package com.example.demo.Controller;

import com.example.demo.Entity.TableEntity;
import com.example.demo.Service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/tables")
public class TableController {

    @Autowired
    private TableService service;

    @GetMapping
    public List<TableEntity> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}/status")
    public TableEntity updateStatus(@PathVariable Long id,
                                    @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    @PostMapping
    public TableEntity create(@RequestBody TableEntity t) {
        return service.create(t);
    }

    @PutMapping("/{id}")
    public TableEntity update(@PathVariable Long id, @RequestBody TableEntity t) {
        return service.update(id, t);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok("Xóa thành công");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}