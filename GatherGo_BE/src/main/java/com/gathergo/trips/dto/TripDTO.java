package com.gathergo.trips.dto;

import com.gathergo.shared.dto.CurrencyCode;
import com.gathergo.shared.dto.PointDTO;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class TripDTO {
    private String uuid;
    private String ownerEmail;
    private PointDTO location;
    private Date dateStart;
    private Date dateEnd;
    private int budget;
    private CurrencyCode currency;
    private int maxPeople;
    private String itinerary;
    private String accommodation;
    private String imageURL;//main trip Image
    private boolean isPublic;
    //Mara
    private List<String> imageURLs;
    private ArrayList<String> participants;

    public TripDTO() {

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

    public Date getDateStart() {
        return dateStart;
    }

    public void setDateStart(Date dateStart) {
        this.dateStart = dateStart;
    }

    public Date getDateEnd() {
        return dateEnd;
    }

    public void setDateEnd(Date dateEnd) {
        this.dateEnd = dateEnd;
    }

    public int getBudget() {
        return budget;
    }

    public void setBudget(int budget) {
        this.budget = budget;
    }

    public CurrencyCode getCurrency() {
        return currency;
    }

    public void setCurrency(CurrencyCode currency) {
        this.currency = currency;
    }

    public int getMaxPeople() {
        return maxPeople;
    }

    public void setMaxPeople(int maxPeople) {
        this.maxPeople = maxPeople;
    }

    public String getItinerary() {
        return itinerary;
    }

    public void setItinerary(String itinerary) {
        this.itinerary = itinerary;
    }

    public String getAccommodation() {
        return accommodation;
    }

    public void setAccommodation(String accommodation) {
        this.accommodation = accommodation;
    }

    public String getImageURL() {
        return imageURL;
    }

    public void setImageURL(String imageURL) {
        this.imageURL = imageURL;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }

    public ArrayList<String> getParticipants() {
        if (participants == null) {
            participants = new ArrayList<>();
        }
        return participants;
    }

    public void setParticipants(ArrayList<String> participants) {
        this.participants = participants;
    }

    public boolean containsParticipant(String participant) {
        return getParticipants().contains(participant);
    }

    public void addParticipant(String participant) {
        getParticipants().add(participant);
    }

    //Mara
    public List<String> getImageURLs(){
        if(imageURLs==null){
            imageURLs=new ArrayList<>();
        }
        return imageURLs;
    }

    public void setImageURLs(List<String> imageURLs){
        this.imageURLs=imageURLs;
    }
}
