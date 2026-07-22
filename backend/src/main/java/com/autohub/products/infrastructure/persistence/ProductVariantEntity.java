package com.autohub.products.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_variants")
public class ProductVariantEntity {

    @Id private UUID id;
    @Column(name = "product_id", nullable = false) private UUID productId;
    @Column(nullable = false) private String name;
    @Column private BigDecimal price;
    @Column private String power;
    @Column private String mileage;
    @Column(nullable = false) private int position;

    protected ProductVariantEntity() { }

    public ProductVariantEntity(UUID id, UUID productId, String name, BigDecimal price,
                                String power, String mileage, int position) {
        this.id = id; this.productId = productId; this.name = name;
        this.price = price; this.power = power; this.mileage = mileage; this.position = position;
    }

    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public String getPower() { return power; }
    public String getMileage() { return mileage; }
    public int getPosition() { return position; }
}
