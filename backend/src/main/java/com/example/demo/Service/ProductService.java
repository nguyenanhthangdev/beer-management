package com.example.demo.Service;

import com.example.demo.Entity.Product;
import com.example.demo.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    public List<Product> getAll() {
        return repo.findAll();
    }

    public Product create(Product p) {
        return repo.save(p);
    }

    public Product update(Long id, Product p) {
        Product old = repo.findById(id).orElseThrow();
        old.setName(p.getName());
        old.setPrice(p.getPrice());
        return repo.save(old);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}