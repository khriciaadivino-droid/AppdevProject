import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    FlatList,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../utils/routes';

const { width, height } = Dimensions.get('window');

const FALLBACK_IMAGE = require('../assets/images/logo.png');
const PRODUCT_IMAGES = {
    'Charlie-s-Choice-69c01614331a4.jpg': require('../assets/images/Charlie-s-Choice-69c01614331a4.jpg'),
    'aesthetic-cage-69c0211ba9536.jpg': require('../assets/images/aesthetic-cage-69c0211ba9536.jpg'),
    'AllPetSolutions-4-Piece-Dog-Grooming-Set-69c0202724f1d.jpg': require('../assets/images/AllPetSolutions-4-Piece-Dog-Grooming-Set-69c0202724f1d.jpg'),
    'Bark-Bright-69c01f8975e9c.jpg': require('../assets/images/Bark-Bright-69c01f8975e9c.jpg'),
    'Blue-dog-harness-69c0208b5c230.jpg': require('../assets/images/Blue-dog-harness-69c0208b5c230.jpg'),
    'pet-wipes-69c03c6755705.jpg': require('../assets/images/pet-wipes-69c03c6755705.jpg'),
    'Loveabowl-Salmon-Dry-Cat-Food-69c03c1984b88.jpg': require('../assets/images/Loveabowl-Salmon-Dry-Cat-Food-69c03c1984b88.jpg'),
    'Pet-Feet-Shower-Cup-69c03cdff0f0a.jpg': require('../assets/images/Pet-Feet-Shower-Cup-69c03cdff0f0a.jpg'),
};
const TEAM_IMAGES = {
    'KhriciaDivino.jpg': require('../assets/images/KhriciaDivino.jpg'),
    'Jim.jpg': require('../assets/images/Jim.jpg'),
    'Rhea.png': require('../assets/images/Rhea.png'),
    'vincent.png': require('../assets/images/vincent.png'),
};
const GALLERY_IMAGES = {
    'gallery8.jpg': require('../assets/images/gallery8.jpg'),
    'gallery6.jpg': require('../assets/images/gallery6.jpg'),
    'gallery7.jpg': require('../assets/images/gallery7.jpg'),
    'gallery10.jpg': require('../assets/images/gallery10.jpg'),
    'gallery11.jpg': require('../assets/images/gallery11.jpg'),
};

const LandingScreen = () => {
    const navigation = useNavigation();
    const swiperRef = useRef(null);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const isNarrow = width < 420;
    const isSmall = width < 360;
    const teamColumns = isNarrow ? 1 : 2;

    const productItems = [
        {
            id: 1,
            name: "Charlie's Choice",
            img: 'Charlie-s-Choice-69c01614331a4.jpg',
            price: '150.00',
            desc: '72% salmon content',
            rating: 4.8,
            reviews: 148,
        },
        {
            id: 2,
            name: 'Carriers',
            img: 'aesthetic-cage-69c0211ba9536.jpg',
            price: '699.00',
            desc: 'Hard-sided travel',
            rating: 4.6,
            reviews: 92,
        },
        {
            id: 3,
            name: 'Grooming Set',
            img: 'AllPetSolutions-4-Piece-Dog-Grooming-Set-69c0202724f1d.jpg',
            price: '200.00',
            desc: '4-piece kit',
            rating: 4.7,
            reviews: 75,
        },
        {
            id: 4,
            name: 'Dental Chews',
            img: 'Bark-Bright-69c01f8975e9c.jpg',
            price: '199.00',
            desc: 'Chicken-based',
            rating: 4.9,
            reviews: 164,
        },
        {
            id: 5,
            name: 'Harness Set',
            img: 'Blue-dog-harness-69c0208b5c230.jpg',
            price: '500.00',
            desc: 'Walking kit',
            rating: 4.5,
            reviews: 66,
        },
        {
            id: 6,
            name: 'Pet Wipes',
            img: 'pet-wipes-69c03c6755705.jpg',
            price: '50.00',
            desc: 'Gentle cleaning',
            rating: 4.4,
            reviews: 58,
        },
        {
            id: 7,
            name: 'Salmon Dry Food',
            img: 'Loveabowl-Salmon-Dry-Cat-Food-69c03c1984b88.jpg',
            price: '99.00',
            desc: 'Grain-free',
            rating: 4.8,
            reviews: 139,
        },
        {
            id: 8,
            name: 'Shower Cup',
            img: 'Pet-Feet-Shower-Cup-69c03cdff0f0a.jpg',
            price: '144.00',
            desc: 'Paw cleaner',
            rating: 4.3,
            reviews: 44,
        },
    ];

    const teamMembers = [
        { id: 1, name: 'Khricia Divino', img: 'KhriciaDivino.jpg', role: 'Founder & CEO' },
        { id: 2, name: 'Jimwella De Guzman', img: 'Jim.jpg', role: 'Product Director' },
        { id: 3, name: 'Rhea Amor Delejero', img: 'Rhea.png', role: 'Customer Success Lead' },
        { id: 4, name: 'Vincent Delostrico', img: 'vincent.png', role: 'Operations Manager' },
    ];

    const galleryItems = [
        { id: 1, img: 'gallery8.jpg', title: 'HUMAN!', subtitle: 'YOU NEED ME', color: '#87d3f8' },
        { id: 2, img: 'gallery6.jpg', title: 'ADOPT A', subtitle: 'FRIEND', color: '#6485cd' },
        { id: 3, img: 'gallery7.jpg', title: 'TRUE BEST', subtitle: 'FRIEND', color: '#87d3f8' },
        { id: 4, img: 'gallery10.jpg', title: 'PARTNER', subtitle: 'OF LIFE', color: '#6485cd' },
        { id: 5, img: 'gallery11.jpg', title: 'PUPPY IS', subtitle: 'THE ANSWER', color: '#87d3f8' },
    ];

    const testimonials = [
        {
            id: 1,
            quote: 'Inventory is finally easy to track in one place.',
            message: 'Before PawStuff we kept missing low-stock alerts. Now our restocks are on time and our team works faster every week.',
            name: 'James Cameron',
        },
        {
            id: 2,
            quote: 'The dashboard gave us better control in days.',
            message: 'Everything from products to orders feels connected. It helped us make decisions quickly without digging through spreadsheets.',
            name: 'Liam Harper',
        },
        {
            id: 3,
            quote: 'Support is responsive and actually helpful.',
            message: 'We had custom workflow questions and got clear answers fast. The platform feels built for real pet care operations.',
            name: 'Sophia Reyes',
        },
        {
            id: 4,
            quote: 'Our front desk process is smoother now.',
            message: 'From customer records to checkout, our daily flow is cleaner and less stressful. PawStuff saved us hours every week.',
            name: 'Noah Bennett',
        },
    ];

    const renderStar = (filled) => (
        <Text style={[styles.star, filled && styles.starFilled]}>★</Text>
    );

    const renderProductCard = ({ item, index }) => (
        <View
            style={[
                styles.productCard,
                {
                    backgroundColor: index % 2 === 0 ? '#87d3f8' : '#ffffff',
                    marginRight: width * 0.05,
                    width: isSmall ? width * 0.86 : width * 0.8,
                },
            ]}
        >
            <Image
                source={PRODUCT_IMAGES[item.img] || FALLBACK_IMAGE}
                style={[styles.productImage, isSmall && styles.productImageSmall]}
            />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productDesc}>{item.desc}</Text>
            <View style={styles.productRating}>
                {[1, 2, 3, 4, 5].map((i) => renderStar(i <= Math.floor(item.rating)))}
                <Text style={styles.ratingText}>
                    {item.rating.toFixed(1)} ({item.reviews})
                </Text>
            </View>
            <Text style={styles.productPrice}>₱{item.price}</Text>
        </View>
    );

    const renderTeamMember = ({ item }) => (
        <View style={[styles.teamCard, { width: width * 0.72, marginRight: 16 }]}>
            <Image source={TEAM_IMAGES[item.img] || FALLBACK_IMAGE} style={styles.teamImage} />
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.teamRole}>{item.role}</Text>
        </View>
    );

    const renderGalleryCard = ({ item }) => (
        <View style={[styles.galleryCard, { backgroundColor: item.color, marginRight: 12 }]}>
            <Text style={styles.galleryTitle}>{item.title}</Text>
            <Text style={styles.gallerySubtitle}>{item.subtitle}</Text>
            <Image source={GALLERY_IMAGES[item.img] || FALLBACK_IMAGE} style={styles.galleryImage} />
        </View>
    );

    const renderTestimonial = ({ item }) => (
        <View style={[styles.testimonialCard, { marginRight: width * 0.05 }]}>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.testimonialQuote}>{item.quote}</Text>
            <Text style={styles.testimonialMessage}>{item.message}</Text>
            <Text style={styles.testimonialAuthor}>{item.name}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Banner / Hero Section */}
            <View style={styles.banner}>
                <View style={styles.topRow}>
                    <Text style={styles.logo}>PawStuff</Text>
                </View>

                <View style={styles.heroCopy}>
                    <Text style={styles.heroSmall}>At PawStuff</Text>
                    <Text style={[styles.heroTitle, isSmall && styles.heroTitleSmall]}>
                        We make pet care simple. Quality supplies, happy pets, wagging tails.
                    </Text>
                    <Text style={[styles.heroDesc, isSmall && styles.heroDescSmall]}>
                        We believe every pet deserves the best. From premium nutrition to playful toys and cozy essentials, we carefully curate products that keep tails wagging and purrs coming.
                    </Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => navigation.navigate(SCREENS.LOGIN)}
                        activeOpacity={0.85}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                    >
                        <Text style={styles.shopButtonText}>Shop Now</Text>
                    </TouchableOpacity>
                </View>

                <Image
                    source={require('../assets/images/ddog2-removebg-preview.png')}
                    style={[styles.dogImage, isSmall && styles.dogImageSmall]}
                />
                <Image
                    source={require('../assets/images/cat1-removebg-preview.png')}
                    style={[styles.catImage, isSmall && styles.catImageSmall]}
                />
            </View>

            {/* Team Section */}
            <View style={styles.teamSection}>
                <Text style={styles.sectionSmall}>Meet Our Team</Text>
                <Text style={[styles.teamSectionTitle, isSmall && styles.teamSectionTitleSmall]}>
            
                </Text>
                <Text style={[styles.sectionDesc, isSmall && styles.sectionDescSmall]}>
                    Our passionate team is dedicated to delivering the best products and service for pet owners everywhere. We believe in quality, care, and making pets happy.
                </Text>

                <FlatList
                    data={teamMembers}
                    renderItem={renderTeamMember}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    snapToInterval={width * 0.72 + 16}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />

                <TouchableOpacity style={styles.learnMoreButton}>
                    <Text style={styles.learnMoreText}>Learn More About Us</Text>
                </TouchableOpacity>
            </View>

            {/* Products Section */}
            <View style={styles.productsSection}>
                <Text style={[styles.productsSectionTitle, isSmall && styles.productsSectionTitleSmall]}>
                    Browse Products
                </Text>
                <FlatList
                    ref={swiperRef}
                    data={productItems}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={(event) => {
                        const x = event.nativeEvent.contentOffset.x;
                        const index = Math.round(x / (width * 0.9));
                        setCurrentProductIndex(index);
                    }}
                    snapToInterval={width * 0.9}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>

            {/* Gallery Section */}
            <View style={styles.gallerySection}>
                <Text style={styles.sectionSmall}></Text>
                <Text style={[styles.galleryTitle2, isSmall && styles.galleryTitle2Small]}>
                    Happy Paws, Happy Moments
                </Text>
                <FlatList
                    data={galleryItems}
                    renderItem={renderGalleryCard}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>

            {/* Why Choose Us Section */}
            <View style={styles.whyChooseSection}>
                <View style={styles.whyChooseContent}>
                    <Text style={styles.whyChooseSmall}>Why Choose PawStuff</Text>
                    <Text style={[styles.whyChooseTitle, isSmall && styles.whyChooseTitleSmall]}>
                        Efficiency meets empathy.
                    </Text>
                    <Text style={[styles.whyChooseDesc, isSmall && styles.whyChooseDescSmall]}>
                        We don't just offer products. We help pet parents and pet businesses run smarter daily operations with dependable tools, thoughtful support, and standards you can trust.
                    </Text>

                    <View style={styles.whyChooseList}>
                        <View style={styles.listItem}>
                            <View style={styles.checkCircle}>
                                <Text style={styles.checkText}>✓</Text>
                            </View>
                            <Text style={styles.listText}>Trusted Product Quality</Text>
                        </View>
                        <View style={styles.listItem}>
                            <View style={styles.checkCircle}>
                                <Text style={styles.checkText}>✓</Text>
                            </View>
                            <Text style={styles.listText}>Data-Driven Store Management</Text>
                        </View>
                        <View style={styles.listItem}>
                            <View style={styles.checkCircle}>
                                <Text style={styles.checkText}>✓</Text>
                            </View>
                            <Text style={styles.listText}>Fast, Human-Centered Support</Text>
                        </View>
                    </View>
                </View>

                <Image source={require('../assets/images/catdog-removebg-preview.png')} style={styles.whyChooseImage} />
            </View>

            {/* Testimonials Section */}
            <View style={styles.testimonialsSection}>
                <Text style={[styles.testimonialsSectionTitle, isSmall && styles.testimonialsSectionTitleSmall]}>
                    Customer Testimonials
                </Text>
                <Text style={[styles.testimonialsSectionDesc, isSmall && styles.testimonialsSectionDescSmall]}>
                    Real feedback from pet parents and clinics using PawStuff every day.
                </Text>

                <FlatList
                    data={testimonials}
                    renderItem={renderTestimonial}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    snapToInterval={width * 0.85}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={[styles.footerContent, isNarrow && styles.footerContentStack]}>
                    <View style={[styles.footerColumn, isNarrow && styles.footerColumnStack]}>
                        <Text style={styles.footerTitle}>PawStuff</Text>
                        <Text style={styles.footerText}>
                            Making pet care simple and accessible for everyone, one wagging tail at a time.
                        </Text>
                    </View>

                    <View style={[styles.footerColumn, isNarrow && styles.footerColumnStack]}>
                        <Text style={styles.footerSubtitle}>Quick Links</Text>
                        <TouchableOpacity onPress={() => navigation.navigate(SCREENS.LANDING)}>
                            <Text style={styles.footerLink}>Home</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate(SCREENS.LOGIN)}>
                            <Text style={styles.footerLink}>Shop</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Contact</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footerBottom}>
                    <Text style={styles.copyrightText}>© 2024 PawStuff. All rights reserved.</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f5f9',
    },
    // Banner Styles
    banner: {
        height: Math.max(height * 0.55, 420),
        backgroundColor: '#ffffff',
        paddingTop: 16,
        paddingHorizontal: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginBottom: 20,
    },
    logo: {
        fontSize: 24,
        fontWeight: '800',
        color: '#154b7f',
        letterSpacing: -0.5,
    },
    heroCopy: {
        paddingHorizontal: 12,
        marginTop: 20,
        position: 'relative',
        zIndex: 10,
    },
    heroSmall: {
        color: '#1a4d80',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#171a21',
        marginTop: 8,
        lineHeight: 32,
        letterSpacing: -0.5,
    },
    heroTitleSmall: {
        fontSize: 24,
        lineHeight: 28,
    },
    heroDesc: {
        color: '#50555f',
        fontSize: 13,
        lineHeight: 20,
        marginTop: 12,
    },
    heroDescSmall: {
        fontSize: 12,
        lineHeight: 17,
    },
    shopButton: {
        marginTop: 16,
        backgroundColor: '#2baf6f',
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignSelf: 'flex-start',
        zIndex: 12,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },
    shopButtonText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 11,
        letterSpacing: 0.5,
    },
    dogImage: {
        position: 'absolute',
        right: 0,
        bottom: 135,
        width: width * 0.45,
        height: '100%',
        resizeMode: 'contain',
    },
    dogImageSmall: {
        width: width * 0.4,
        height: '90%',
    },
    catImage: {
        position: 'absolute',
        left: 16,
        bottom: -29,
        width: width * 0.35,
        height: '70%',
        resizeMode: 'contain',
    },
    catImageSmall: {
        width: width * 0.3,
        height: '60%',
    },
    // Team Section
    teamSection: {
        backgroundColor: '#154b7f',
        paddingVertical: 48,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    sectionSmall: {
        color: '#e8f0f8',
        fontWeight: '700',
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#ffffff',
        marginTop: 8,
        marginBottom: 16,
        textAlign: 'center',
    },
    sectionTitleSmall: {
        fontSize: 24,
    },
    teamSectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        marginTop: 8,
        marginBottom: 16,
        textAlign: 'left',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
    },
    teamSectionTitleSmall: {
        fontSize: 20,
    },
    sectionDesc: {
        color: '#e8f0f8',
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: '90%',
    },
    sectionDescSmall: {
        fontSize: 12,
        lineHeight: 18,
    },
    teamCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    teamImage: {
        width: '100%',
        height: width * 0.55,
        borderRadius: 12,
        marginBottom: 12,
        resizeMode: 'cover',
    },
    teamName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#154b7f',
        marginBottom: 4,
        textAlign: 'center',
    },
    teamRole: {
        color: '#50555f',
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
    learnMoreButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 50,
        marginTop: 16,
    },
    learnMoreText: {
        color: '#154b7f',
        fontWeight: '700',
        fontSize: 13,
        textAlign: 'center',
    },
    // Products Section
    productsSection: {
        backgroundColor: '#ffffff',
        paddingVertical: 48,
        paddingHorizontal: 0,
    },
    productsSectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#154b7f',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    productsSectionTitleSmall: {
        fontSize: 20,
    },
    productCard: {
        borderRadius: 16,
        padding: 16,
        width: width * 0.8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: 110,
        height: 110,
        resizeMode: 'contain',
        marginBottom: 12,
    },
    productImageSmall: {
        width: 96,
        height: 96,
    },
    productName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#154b7f',
        marginBottom: 6,
        textAlign: 'center',
    },
    productDesc: {
        color: '#50555f',
        fontSize: 11,
        marginBottom: 12,
        textAlign: 'center',
    },
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'center',
    },
    star: {
        color: '#c9d3de',
        fontSize: 12,
        marginHorizontal: 2,
    },
    starFilled: {
        color: '#f4b740',
    },
    ratingText: {
        color: '#50555f',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 6,
    },
    productPrice: {
        fontWeight: '800',
        color: '#2baf6f',
        fontSize: 14,
    },
    // Gallery Section
    gallerySection: {
        backgroundColor: '#ffffff',
        paddingVertical: 48,
    },
    galleryTitle2: {
        fontSize: 24,
        fontWeight: '900',
        color: '#171a21',
        marginBottom: 24,
        paddingHorizontal: 16,
        textAlign: 'center',
    },
    galleryTitle2Small: {
        fontSize: 20,
    },
    galleryCard: {
        borderRadius: 22,
        width: width * 0.65,
        aspectRatio: 9 / 14,
        padding: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    galleryTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#194c80',
        textAlign: 'center',
        lineHeight: 22,
    },
    gallerySubtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(25, 76, 128, 0.7)',
        marginTop: 4,
    },
    galleryImage: {
        width: '85%',
        height: '50%',
        resizeMode: 'contain',
    },
    // Why Choose Us
    whyChooseSection: {
        backgroundColor: '#ffffff',
        paddingVertical: 48,
        paddingHorizontal: 16,
    },
    whyChooseContent: {
        marginBottom: 32,
    },
    whyChooseSmall: {
        color: '#1f5f9a',
        fontWeight: '700',
        fontSize: 11,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    whyChooseTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#171a21',
        lineHeight: 28,
        marginBottom: 12,
    },
    whyChooseTitleSmall: {
        fontSize: 20,
        lineHeight: 24,
    },
    whyChooseDesc: {
        color: '#4a5568',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 20,
    },
    whyChooseDescSmall: {
        fontSize: 12,
        lineHeight: 18,
    },
    whyChooseList: {
        gap: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(31, 95, 154, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkText: {
        color: '#1f5f9a',
        fontSize: 10,
    },
    listText: {
        fontWeight: '700',
        color: '#2d3748',
        fontSize: 12,
    },
    whyChooseImage: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
    },
    // Testimonials
    testimonialsSection: {
        backgroundColor: '#6485cd',
        paddingVertical: 32,
        paddingHorizontal: 0,
        marginTop: 32,
    },
    testimonialsSectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#ffffff',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    testimonialsSectionTitleSmall: {
        fontSize: 20,
    },
    testimonialsSectionDesc: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    testimonialsSectionDescSmall: {
        fontSize: 11,
        lineHeight: 16,
    },
    testimonialCard: {
        backgroundColor: '#f8fafc',
        color: '#171a21',
        borderRadius: 10,
        padding: 16,
        width: width * 0.75,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    stars: {
        color: '#e6a83b',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    testimonialQuote: {
        fontSize: 12,
        fontWeight: '700',
        color: '#171a21',
        lineHeight: 16,
        marginBottom: 8,
    },
    testimonialMessage: {
        fontSize: 11,
        lineHeight: 16,
        fontStyle: 'italic',
        color: '#586171',
        marginBottom: 12,
    },
    testimonialAuthor: {
        fontSize: 10,
        fontWeight: '700',
        color: '#171a21',
    },
    // Footer
    footer: {
        backgroundColor: '#171a21',
        color: '#ffffff',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingBottomColor: '#2d323d',
        borderBottomWidth: 1,
        borderBottomColor: '#2d323d',
        paddingBottom: 24,
    },
    footerContentStack: {
        flexDirection: 'column',
    },
    footerColumnStack: {
        marginBottom: 16,
    },
    footerColumn: {
        flex: 1,
    },
    footerTitle: {
        fontWeight: '800',
        color: '#ffffff',
        fontSize: 14,
        marginBottom: 8,
    },
    footerSubtitle: {
        fontWeight: '700',
        color: '#ffffff',
        fontSize: 13,
        marginBottom: 12,
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 11,
        lineHeight: 16,
    },
    footerLink: {
        color: '#94a3b8',
        fontSize: 11,
        marginVertical: 6,
    },
    footerBottom: {
        textAlign: 'center',
        paddingTop: 16,
    },
    copyrightText: {
        color: '#64748b',
        fontSize: 10,
        textAlign: 'center',
    },
});

export default LandingScreen;
