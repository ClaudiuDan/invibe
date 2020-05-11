import {profileStatus} from "./ProfileStatus";
import PROFILE_IMAGE_PLACEHOLDER from "../../assets/profile-image-placeholder.png";

export default class UserProfile {
    constructor(userId = -1,
                name = "",
                shortDescription = "",
                longDescription = "",
                profileImage = PROFILE_IMAGE_PLACEHOLDER,
                albumImages = [],
                gender = "F",
                longitude = 0,
                latitude = 0,
                status = profileStatus.UNLOADED,
                albumStatus = profileStatus.UNLOADED) {

        this._userId = userId;
        this._name = name;
        this._shortDescription = shortDescription;
        this._longDescription = longDescription;
        this._profileImage = profileImage;
        this._albumImages = albumImages;
        this._status = status;
        this._albumStatus = albumStatus;
        this._gender = gender;
        this._longitude = longitude;
        this._latitude = latitude;
    }

    shallowCopy() {
        return new UserProfile(this.userId,
            this.name,
            this.shortDescription,
            this.longDescription,
            this.profileImage,
            this.albumImages,
            this.gender,
            this.longitude,
            this.latitude,
            this.status,
            this.albumStatus);
    }

    // Getters and setters
    get userId() {
        return this._userId;
    }

    get albumStatus() {
        return this._albumStatus;
    }

    get shortDescription() {
        return this._shortDescription;
    }

    get longDescription() {
        return this._longDescription;
    }

    get name() {
        return this._name;
    }

    get profileImage() {
        return this._profileImage;
    }

    get gender() {
        return this._gender;
    }


    get albumImages() {
        return this._albumImages;
    }

    get status() {
        return this._status;
    }

    set userId(value) {
        this._userId = value;
    }

    set name(value) {
        this._name = value;
    }

    set shortDescription(value) {
        this._shortDescription = value;
    }

    set longDescription(value) {
        this._longDescription = value;
    }

    set profileImage(value) {
        this._profileImage = value;
    }

    set albumImages(value) {
        this._albumImages = value;
    }

    set status(value) {
        this._status = value;
    }

    set albumStatus(value) {
        this._albumStatus = value;
    }

    set gender(value) {
        this._gender = value;
    }

    get longitude() {
        return this._longitude;
    }

    set longitude(value) {
        this._longitude = value;
    }

    get latitude() {
        return this._latitude;
    }

    set latitude(value) {
        this._latitude = value;
    }

}