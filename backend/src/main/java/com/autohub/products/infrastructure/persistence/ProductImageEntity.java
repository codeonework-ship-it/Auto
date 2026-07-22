package com.autohub.products.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.UUID;

/**
 * Original generated SVG artwork for a product, stored in the database and served by
 * {@code GET /api/v1/products/{slug}/images/{position}}. Being vector art, each image is a
 * few KB, loads instantly, and is entirely original (no external/copyrighted assets).
 */
@Entity
@Table(name = "product_images", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "position"}))
public class ProductImageEntity {

    @Id private UUID id;
    @Column(name = "product_id", nullable = false) private UUID productId;
    @Column(nullable = false) private int position;
    @Column private String label;
    @Column(nullable = false, columnDefinition = "text") private String svg;

    protected ProductImageEntity() { }

    public ProductImageEntity(UUID id, UUID productId, int position, String label, String svg) {
        this.id = id; this.productId = productId; this.position = position; this.label = label; this.svg = svg;
    }

    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public int getPosition() { return position; }
    public String getLabel() { return label; }
    public String getSvg() { return svg; }
}
