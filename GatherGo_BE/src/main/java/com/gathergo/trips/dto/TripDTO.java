package com.gathergo.trips.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gathergo.shared.dto.CurrencyCode;
import com.gathergo.shared.dto.PointDTO;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class TripDTO {
    private String uuid;
    private String ownerEmail;
    private String name;
    private PointDTO location;
    private Date dateStart;
    private Date dateEnd;
    private int budget;
    private CurrencyCode currency;
    private int maxPeople;
    private String itinerary;
    private String accommodation;
    private List<String> accommodationSuggestions;
    private String imageURL;//main trip Image
    @JsonProperty("isPublic")
    private boolean isPublic;
    //Mara
    private List<String> imageURLs;
    private List<String> participants;

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

    public void addItinerary(String item) {
        if (item == null || item.isBlank()) return;

        String current = (itinerary == null) ? "" : itinerary;

        if (current.isBlank()) {
            itinerary = item.trim();
        } else {
            itinerary = current + "\n" + item.trim();
        }
    }

    public String getAccommodation() {
        return accommodation;
    }

    public void setAccommodation(String accommodation) {
        this.accommodation = accommodation;
    }

    public List<String> getAccommodationSuggestions() {
        if (accommodationSuggestions == null) accommodationSuggestions = new ArrayList<>();
        return accommodationSuggestions;
    }

    public void setAccommodationSuggestions(List<String> accommodationSuggestions) {
        this.accommodationSuggestions = accommodationSuggestions;
    }

    public void addAccommodation(String item) {
        if (item == null || item.isBlank()) return;
        getAccommodationSuggestions().add(item);
    }

    public boolean canEditTrip(String email) {
        if (email == null) return false;
        if (ownerEmail != null && ownerEmail.equalsIgnoreCase(email)) return true;
        return participants != null && participants.stream().anyMatch(p -> p.equalsIgnoreCase(email));
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
        this.isPublic = aPublic;
    }

    public List<String> getParticipants() {
        if (participants == null) {
            participants = new ArrayList<>();
        }
        return participants;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }

    public boolean containsParticipant(String participant) {
        return getParticipants().contains(participant);
    }

    public void addParticipant(String participant) {
        getParticipants().add(participant);
    }

    //CASE SENSITIVE
//    public boolean containsParticipant(String participant) {
//        if (participant == null) return false;
//        String p = participant.trim();
//        return getParticipants().stream()
//                .anyMatch(x -> x != null && x.trim().equalsIgnoreCase(p));
//    }
//
//    public void addParticipant(String participant) {
//        if (participant == null || participant.isBlank()) return;
//        if (!containsParticipant(participant)) getParticipants().add(participant.trim());
//    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public boolean containsImageUrl(String url) {
        if (url == null) return false;
        return getImageURLs().stream().anyMatch(u -> u != null && u.equals(url));
    }

    public void addImageUrl(String url) {
        if (url == null || url.isBlank()) return;
        getImageURLs().add(url.trim());
    }
}
