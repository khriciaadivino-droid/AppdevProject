export const SCREENS = {
    LANDING: 'Landing',
    ABOUT: 'About',
    HOME: 'Home',
    PROFILE: 'Profile',
    LOGIN: 'Login',
    REGISTER: 'Register',
    DASHBOARD_USER: 'DashboardUser',
    PET_PROFILES: 'PetProfiles',
    ADD_PET: 'AddPet',
    EDIT_PET: 'EditPet',
    ORDERS: 'Orders',
    ADD_ORDER: 'AddOrder',
    EDIT_ORDER: 'EditOrder',
    ADD_PRODUCT: 'AddProduct',
    CART: 'Cart',
    CHECKOUT: 'Checkout',
} as const;

export type ScreenName = typeof SCREENS[keyof typeof SCREENS];

export default SCREENS;
