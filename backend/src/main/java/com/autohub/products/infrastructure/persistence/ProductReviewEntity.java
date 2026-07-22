package com.autohub.products.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "product_reviews")
public class ProductReviewEntity {

    @Id private UUID id;
    @Column(name = "product_id", nullable = false) private UUID productId;
    @Column(nullable = false) private String author;
    @Column(nullable = false) private double rating;
    @Column(nullable = false) private String title;
    @Column(nullable = false, columnDefinition = "text") private String content;
    @Column(name = "review_date", nullable = false) private String reviewDate;
    @Column(nullable = false) private boolean verified = true;
    @Column(nullable = false) private String ownership = "Owner";
    @Column(name = "variant_name") private String variantName;
    @Column(columnDefinition = "text") private String pros;   // '|' separated
    @Column(columnDefinition = "text") private String cons;   // '|' separated
    @Column(nullable = false) private int helpful;
    @Column(nullable = false) private int position;

    protected ProductReviewEntity() { }

    public ProductReviewEntity(UUID id, UUID productId, String author, double rating, String title,
                               String content, String reviewDate, boolean verified, String ownership,
                               String variantName, String pros, String cons, int helpful, int position) {
        this.id = id; this.productId = productId; this.author = author; this.rating = rating;
        this.title = title; this.content = content; this.reviewDate = reviewDate; this.verified = verified;
        this.ownership = ownership; this.variantName = variantName; this.pros = pros; this.cons = cons;
        this.helpful = helpful; this.position = position;
    }

    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public String getAuthor() { return author; }
    public double getRating() { return rating; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getReviewDate() { return reviewDate; }
    public boolean isVerified() { return verified; }
    public String getOwnership() { return ownership; }
    public String getVariantName() { return variantName; }
    public String getPros() { return pros; }
    public String getCons() { return cons; }
    public int getHelpful() { return helpful; }
    public int getPosition() { return position; }
}
