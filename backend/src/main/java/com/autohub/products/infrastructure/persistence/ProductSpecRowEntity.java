package com.autohub.products.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/** One key/value row of a grouped technical-specification table. */
@Entity
@Table(name = "product_spec_rows")
public class ProductSpecRowEntity {

    @Id private UUID id;
    @Column(name = "product_id", nullable = false) private UUID productId;
    @Column(nullable = false) private String grp;
    @Column(nullable = false) private String k;
    @Column(nullable = false) private String v;
    @Column(nullable = false) private int position;

    protected ProductSpecRowEntity() { }

    public ProductSpecRowEntity(UUID id, UUID productId, String grp, String k, String v, int position) {
        this.id = id; this.productId = productId; this.grp = grp; this.k = k; this.v = v; this.position = position;
    }

    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public String getGrp() { return grp; }
    public String getK() { return k; }
    public String getV() { return v; }
    public int getPosition() { return position; }
}
