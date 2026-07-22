package com.autohub.products.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Catalog-of-record product (car or bike) backing the MOTORA marketplace showcase.
 * Scalar spec fields live here so list/compare/filter endpoints need no joins;
 * grouped technical specs, variants, images and reviews are child tables.
 */
@Entity
@Table(name = "products")
public class ProductEntity {

    @Id private UUID id;
    @Column(nullable = false, unique = true) private String slug;
    @Column(nullable = false) private String type;          // CAR | BIKE
    @Column(nullable = false) private String brand;
    @Column(nullable = false) private String model;
    @Column(nullable = false) private String category;
    @Column private BigDecimal price;
    @Column(nullable = false) private int searches;
    @Column(nullable = false) private double rating;
    @Column(name = "review_count", nullable = false) private int reviewCount;
    @Column(nullable = false) private String availability = "New";
    @Column(nullable = false) private String fuel;
    @Column private String transmission;
    @Column private String drivetrain;
    @Column private Integer seating;
    @Column private String power;
    @Column private String torque;
    @Column private String mileage;
    @Column private Integer safety;
    @Column private Boolean adas;
    @Column private Boolean sunroof;
    @Column private String kerb;
    @Column(name = "seat_height") private String seatHeight;
    @Column(name = "abs_type") private String absType;
    @Column private String cooling;
    @Column(name = "charge_time") private String chargeTime;
    @Column private String highlight;
    @Column(nullable = false) private int hue = 210;
    @Column(columnDefinition = "text") private String tags;      // '|' separated
    @Column(columnDefinition = "text") private String colors;    // '|' separated
    @Column(columnDefinition = "text") private String pros;      // '|' separated
    @Column(columnDefinition = "text") private String cons;      // '|' separated
    @Column(name = "created_at", nullable = false) private Instant createdAt = Instant.now();

    protected ProductEntity() { }

    public ProductEntity(UUID id, String slug, String type, String brand, String model, String category) {
        this.id = id; this.slug = slug; this.type = type; this.brand = brand; this.model = model; this.category = category;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getSlug() { return slug; }
    public String getType() { return type; }
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public int getSearches() { return searches; }
    public void setSearches(int searches) { this.searches = searches; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }
    public String getFuel() { return fuel; }
    public void setFuel(String fuel) { this.fuel = fuel; }
    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }
    public String getDrivetrain() { return drivetrain; }
    public void setDrivetrain(String drivetrain) { this.drivetrain = drivetrain; }
    public Integer getSeating() { return seating; }
    public void setSeating(Integer seating) { this.seating = seating; }
    public String getPower() { return power; }
    public void setPower(String power) { this.power = power; }
    public String getTorque() { return torque; }
    public void setTorque(String torque) { this.torque = torque; }
    public String getMileage() { return mileage; }
    public void setMileage(String mileage) { this.mileage = mileage; }
    public Integer getSafety() { return safety; }
    public void setSafety(Integer safety) { this.safety = safety; }
    public Boolean getAdas() { return adas; }
    public void setAdas(Boolean adas) { this.adas = adas; }
    public Boolean getSunroof() { return sunroof; }
    public void setSunroof(Boolean sunroof) { this.sunroof = sunroof; }
    public String getKerb() { return kerb; }
    public void setKerb(String kerb) { this.kerb = kerb; }
    public String getSeatHeight() { return seatHeight; }
    public void setSeatHeight(String seatHeight) { this.seatHeight = seatHeight; }
    public String getAbsType() { return absType; }
    public void setAbsType(String absType) { this.absType = absType; }
    public String getCooling() { return cooling; }
    public void setCooling(String cooling) { this.cooling = cooling; }
    public String getChargeTime() { return chargeTime; }
    public void setChargeTime(String chargeTime) { this.chargeTime = chargeTime; }
    public String getHighlight() { return highlight; }
    public void setHighlight(String highlight) { this.highlight = highlight; }
    public int getHue() { return hue; }
    public void setHue(int hue) { this.hue = hue; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getColors() { return colors; }
    public void setColors(String colors) { this.colors = colors; }
    public String getPros() { return pros; }
    public void setPros(String pros) { this.pros = pros; }
    public String getCons() { return cons; }
    public void setCons(String cons) { this.cons = cons; }
}
