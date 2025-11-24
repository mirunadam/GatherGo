package com.gathergo.dto.trips;

import com.gathergo.dto.shared.PointDTO;

import java.util.Date;

public class TripDTO {
    private String uuid;
    private PointDTO location;
    private Date date;
    private int budget;

    public TripDTO() {

    }

    public TripDTO(PointDTO location, Date date, int budget) {
        this.location = location;
        this.date = date;
        this.budget = budget;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public PointDTO getLocation() {
        return location;
    }

    public void setLocation(PointDTO location) {
        this.location = location;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public int getBudget() {
        return budget;
    }

    public void setBudget(int budget) {
        this.budget = budget;
    }

}
