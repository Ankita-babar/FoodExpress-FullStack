
package com.foodexpress.backend;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodRepository foodRepository;

    public FoodController(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    @GetMapping
    public List<Food> getAllFoods() {
        return foodRepository.findByAvailableTrue();
    }

    @GetMapping("/admin")
    public List<Food> getAllFoodsForAdmin() {
        return foodRepository.findAll();
    }

    @GetMapping("/{id}")
    public Food getFoodById(@PathVariable Long id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Food item not found"));
    }

    @GetMapping("/search")
    public List<Food> searchFoods(@RequestParam String name) {
        return foodRepository
                .findByNameContainingIgnoreCaseAndAvailableTrue(name);
    }

    @GetMapping("/category")
    public List<Food> getFoodsByCategory(@RequestParam String name) {
        return foodRepository
                .findByCategoryIgnoreCaseAndAvailableTrue(name);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Food addFood(@Valid @RequestBody Food food) {
        food.setId(null);
        return foodRepository.save(food);
    }

    @PutMapping("/{id}")
    public Food updateFood(
            @PathVariable Long id,
            @Valid @RequestBody Food updatedFood) {

        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Food item not found"));

        food.setName(updatedFood.getName());
        food.setCategory(updatedFood.getCategory());
        food.setPrice(updatedFood.getPrice());
        food.setDescription(updatedFood.getDescription());
        food.setAvailable(updatedFood.isAvailable());

        return foodRepository.save(food);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFood(@PathVariable Long id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Food item not found"));

        foodRepository.delete(food);
    }
}
