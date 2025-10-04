import { HttpClient } from '@angular/common/http';
import { Component, computed, OnInit, signal } from '@angular/core';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { firstValueFrom, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserDetails } from './shared/interface/user';

import { ActivitiesService } from './activities/activities.service';
import { EnquiriesService } from './enquiries/enquiries.service';
import { StorageService } from './shared/services/storage/storage.service';
import { UserService } from './user/user.service';
import { WebSocketService } from './web-socket/web-socket.service';
import { Enquiry } from './shared/interface/enquiry';

// Register swiper js
import { register } from 'swiper/element/bundle';
import { NotificationsService } from './user/notifications/notifications.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

register();

interface NavLinks {
  titleKey: string;
  url: string;
  icon: string;
  signIn?: boolean;
  guest?: boolean;
}

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
  public appPages: NavLinks[] = [
    { titleKey: 'MENU.MAP', url: '/map', icon: 'map' },
    { titleKey: 'MENU.PROPERTIES', url: '/properties', icon: 'home' },
    { titleKey: 'MENU.ENQUIRIES', url: '/enquiries', icon: 'reader' },
    { titleKey: 'MENU.MORTGAGE_CALC', url: '/mortgage-calc', icon: 'calculator' },
    { titleKey: 'MENU.SETTINGS', url: '/settings', icon: 'cog' },
  ];

  public unreadEnquiries = toSignal(
    this.enquiriesService.enquiries$.pipe(
      map((enquiries) => enquiries.filter((item) => this.isUnread(item)).length)
    ),
    { initialValue: 0 }
  );

  public unreadNotifications = toSignal(
    this.notificationsService.notifications$.pipe(
      map((notifications) => notifications.filter((item) => !item.read).length)
    ),
    { initialValue: 0 }
  );

  public user = signal<UserDetails>(undefined);
  public currentLang = signal('es');
  public appLowerPages = computed<NavLinks[]>(() => {
    const pages =  [
      { titleKey: 'MENU.ABOUT', url: '/about', icon: 'help-circle' },
    ]
    if(this.user()) {
      return [...pages,
        { titleKey: 'MENU.ACCOUNT', url: '/user/account', icon: 'person'}
      ];
    }
    return [...pages,
      { titleKey: 'FORMS.REGISTER', url: '/user/register', icon: 'create' },
      { titleKey: 'FORMS.SIGN_IN', url: '/user/signin', icon: 'log-in' },
    ];
  });

  constructor(
    private platform: Platform,
    private storage: StorageService,
    private userService: UserService,
    private alertController: AlertController,
    private toastController: ToastController,
    private http: HttpClient,
    private enquiriesService: EnquiriesService,
    private activitiesService: ActivitiesService,
    private webSocket: WebSocketService,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    await this.platform.ready();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.currentLang.set('es');
    await this.storage.init();
    const isDark = await this.storage.getDartTheme();
    // SET THEME
    if (isDark) {
      document.documentElement.classList.add('ion-palette-dark');
      document.body.classList.add('dark');
    }
    this.userService.user$.subscribe((user) => {
      if (!user) {
        console.log('Unkown User...');
        this.user.set(undefined);
        this.webSocket.disconnect();
        this.enquiriesService.resetState();
        this.notificationsService.resetState();
        this.activitiesService.resetState();
        return;
      }
      console.log('Connect verified user...');
      this.webSocket.connect(this.userService.token);
      console.log('Fetching Enquiries...');
      if (!this.enquiriesService.initialFetchDone()) {
        this.fetchEnquiries();
      }
      console.log('Fetching user details...');
      this.setUserProfile();
    });
    this.checkServer();
  }

  public isHidden(link: NavLinks): boolean {
    if (link.signIn) {
      return !this.user();
    }
    if (link.guest) {
      return !!this.user();
    }
    return false;
  }

  public toggleLanguage(): void {
    const newLang = this.currentLang() === 'es' ? 'en' : 'es';
    this.translate.use(newLang);
    this.currentLang.set(newLang);
  }

  public async signOut(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: this.translate.instant('SIGN_OUT.HEADER'),
      message: this.translate.instant('SIGN_OUT.MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('SIGN_OUT.CANCEL'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { },
        },
        {
          text: this.translate.instant('SIGN_OUT.CONFIRM'),
          cssClass: 'danger',
          handler: async () => {
            await this.userService.signOut();
            this.showSignedOutToast();
          },
        },
      ],
    });
    await alert.present();
  }

  private async setUserProfile(): Promise<void> {
    const res = await this.userService.getCurrentUser();
    if (res.status === 200) {
      const { activities, notifications, ...user } = res.data
      this.user.set(user);
      this.activitiesService.activities = activities;
      this.notificationsService.notifications = notifications;
    }
  }

  private fetchEnquiries(): void {
    this.enquiriesService.fetchEnquiries().then((res) => {
      if (res?.status === 200) {
        this.enquiriesService.enquiries = res.data;
      }
    }).finally(() => this.enquiriesService.initialFetchDone.set(true));
  }

  private async showSignedOutToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: this.translate.instant('TOAST.SIGNED_OUT'),
      color: 'success',
      duration: 3000,
    });
    toast.present();
  }

  private checkServer() {
    firstValueFrom(this.http.get(environment.api.server)).then((data) =>
      console.log(data)
    );
  }

  private isUnread(enquiry: Enquiry) {
    return !enquiry.read && enquiry.users.to.user_id === this.user()?.user_id;
  }
}
