package com.example.demo.Service;

import com.example.demo.Entity.TableEntity;
import com.example.demo.Repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TableService {

    @Autowired
    private TableRepository tableRepo;

    public List<TableEntity> getAll() {
        return tableRepo.findAll();
    }

    public TableEntity updateStatus(Long id, String status) {
        TableEntity table = tableRepo.findById(id).orElseThrow();
        table.setStatus(status);
        return tableRepo.save(table);
    }

    public TableEntity create(TableEntity t) {
        t.setStatus("EMPTY");
        return tableRepo.save(t);
    }

    public TableEntity update(Long id, TableEntity t) {
        TableEntity old = tableRepo.findById(id).orElseThrow();
        old.setName(t.getName());
        return tableRepo.save(old);
    }

    public void delete(Long id) {
        TableEntity t = tableRepo.findById(id).orElseThrow();

        if ("USING".equals(t.getStatus())) {
            throw new IllegalStateException("Bàn đang có khách, không thể xoá");
        }

        tableRepo.deleteById(id);
    }
}