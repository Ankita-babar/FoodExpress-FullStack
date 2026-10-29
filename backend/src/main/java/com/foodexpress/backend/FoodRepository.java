

package com.foodexpress.backend;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodRepository extends JpaRepository<Food, Long> {

    List<Food> findByAvailableTrue();

    List<Food> findByNameContainingIgnoreCaseAndAvailableTrue(String name);

    List<Food> findByCategoryIgnoreCaseAndAvailableTrue(String category);
}

