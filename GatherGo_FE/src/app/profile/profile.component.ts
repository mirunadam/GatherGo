import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { Router } from '@angular/router';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileUploadService } from '../services/file-upload.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // State management
  isEditing = false;
  showPasswordFields = false;
  success = false;
  error = '';
  selectedFile: File | null = null;
  loading = false;
  // User Data (Initialized with values from localStorage)
  user = {
    uid: localStorage.getItem('uid') || '',
    username: '',
    email: localStorage.getItem('email') || '',
    phone: '',
    fullName: '',
    role: localStorage.getItem('role') || 'traveler',
    profilePictureUrl: ''
  };

  // Password fields
  passwords = {
    current: '',
    new: '',
    confirm: ''
  };

  constructor(private profileService: ProfileService, private fileUploadService: FileUploadService, private router: Router) {}

  ngOnInit(): void {
    const uid = localStorage.getItem('uid');
  if (!uid) {
    this.router.navigate(['/login']);
    return;
  }

  this.profileService.getUser(uid).subscribe({
    next: (data:any) => {
      // Syncing the component state with real Firebase data
      this.user.uid = data.uid;
      this.user.email = data.email;
      this.user.fullName = data.fullname || '';
      this.user.phone = data.phone || '';
      this.user.profilePictureUrl = data.profilePictureUrl || '';
      // We keep the username from localStorage or use email as fallback
      this.user.username = data.username || data.email.split('@')[0];
    },
    error: (err:any) => {
      this.error = "Could not load data from Firebase.";
      console.error(err);
    }
  });
  }

  handleEdit(): void {
    this.isEditing = true;
  }

  handleCancel(): void {
    this.isEditing = false;
    this.showPasswordFields = false;
    this.error = '';
    this.resetPasswords();
    // Re-fetch or reset local user data here if needed
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if(this.selectedFile) {
      this.user.profilePictureUrl= URL.createObjectURL(this.selectedFile);
    }
    //  const file = event.target.files[0];
    // if (file && this.isEditing) {
    //   const reader = new FileReader();
    //   reader.onload = (e: any) => {
    //     this.user.profilePictureUrl = e.target.result;
    //   };
    //   reader.readAsDataURL(file);
    // }
    // if (file) {
    //   this.selectedFile = file;
    //   // Show local preview
    //   const reader = new FileReader();
    //   reader.onload = (e: any) => this.user.profilePictureUrl = e.target.result;
    //   reader.readAsDataURL(file);
    // }
  }

  async handleSave(){
    this.loading = true;
  this.error = '';

  // Case 1: User selected a NEW photo
  if (this.selectedFile) {
    const formData = new FormData();
    formData.append('image', this.selectedFile);

    // 1. Upload the image to your colleague's endpoint
    this.fileUploadService.uploadFile(formData).subscribe({
      next: (imageUrl: string) => {
        // 2. We got the URL! Now save the profile with this URL.
        this.saveProfileData(imageUrl);
      },
      error: (err) => {
        this.error = 'Failed to upload image. Please try again.';
        this.loading = false;
      }
    });
  } 
  // Case 2: User did NOT change the photo (just changed name/email)
  else {
    // Pass the existing URL (or null if they never had one)
    this.saveProfileData(this.user.profilePictureUrl); 
  }
}

// Helper method to save the text data
private saveProfileData(photoUrl: string | null): void {
  const payload = {
    uid: this.user.uid,
    username: this.user.username,
    fullname: this.user.fullName,
    email: this.user.email,
    phone: this.user.phone,
    password: this.showPasswordFields ? this.passwords.new : null,
    profilePictureUrl: photoUrl // ✅ This is now a short URL, not Base64!
  };

  this.profileService.updateUser(payload).subscribe({
    next: (res) => {
      this.success = true;
      this.isEditing = false;
      this.loading = false;
      setTimeout(() => this.success = false, 3000);
    },
    error: (err) => {
      this.error = err.error || 'Failed to update profile';
      this.loading = false;
    }
  });
}


  //   this.loading = true;
  //   let finalPhotoUrl = this.user.profilePictureUrl;

  //   try {
  //     // 1. If a new file was selected, upload it to Firebase Storage first
  //     if (this.selectedFile) {
  //       const storage = getStorage();
  //       const fileRef = ref(storage, `profile_pictures/${this.user.uid}`);
  //       const snapshot = await uploadBytes(fileRef, this.selectedFile);
  //       finalPhotoUrl = await getDownloadURL(snapshot.ref); // ✅ This is a real HTTPS URL
  //     }

  //     // 2. Prepare the payload with the REAL URL
  //     const payload = {
  //       uid: this.user.uid,
  //       username: this.user.username,
  //       fullname: this.user.fullName,
  //       email: this.user.email,
  //       phone: this.user.phone,
  //       password: this.showPasswordFields ? this.passwords.new : null,
  //       profilePictureUrl: finalPhotoUrl // ✅ No longer a giant Base64 string
  //     };

  //     // 3. Send to Spring Boot
  //     this.profileService.updateUser(payload).subscribe({
  //       next: (res) => {
  //         this.success = true;
  //         this.isEditing = false;
  //         this.loading = false;
  //       },
  //       error: (err) => {
  //         this.error = "Backend update failed: " + err.error;
  //         this.loading = false;
  //       }
  //     });

  //   } catch (err) {
  //     this.error = "Cloud Storage upload failed.";
  //     this.loading = false;
  //   }
  // }
    // this.error = '';

    // if (this.showPasswordFields) {
    //   if (this.passwords.new !== this.passwords.confirm) {
    //     this.error = 'New passwords do not match';
    //     return;
    //   }
    //   if (this.passwords.new && this.passwords.new.length < 6) {
    //     this.error = 'Password must be at least 6 characters';
    //     return;
    //   }
    // }

    // const payload = {
    //   uid: this.user.uid,
    //   username: this.user.username,
    //   fullname: this.user.fullName, // Make sure this matches 'fullname' in Java
    //   email: this.user.email,
    //   phone: this.user.phone,
    //   profilePictureUrl: this.user.profilePictureUrl|| null,
    //   password: this.showPasswordFields ? this.passwords.new : null
    // };

    // this.profileService.updateUser(payload).subscribe({
    //   next: (res:any) => {
    //     this.success = true;
    //     console.log(res);
    //     this.isEditing = false;
    //     this.showPasswordFields = false;
    //     this.resetPasswords();
    //     setTimeout(() => (this.success = false), 3000);
    //   },
    //   error: (err:any) => {
    //     this.error = 'Failed to update profile. Please try again.';
    //     console.log(err);
    //   }
    // });
  

  private resetPasswords(): void {
    this.passwords = { current: '', new: '', confirm: '' };
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}