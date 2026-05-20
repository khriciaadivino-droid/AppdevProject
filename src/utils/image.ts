/**
 * Image Assets (TypeScript)
 * Central location for all image imports
 */

interface ImageAssets {
    LOGO: any;
    [key: string]: any;
}

const IMAGES: ImageAssets = {
    LOGO: require('../assets/images/logo.png'),
};

export default IMAGES;
