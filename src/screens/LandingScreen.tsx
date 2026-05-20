import React, { FC } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ViewStyle,
    TextStyle,
    FlatList,
    Dimensions,
    Image,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../utils/routes';

const { width, height } = Dimensions.get('window');

// Colors from HTML design
const COLORS = {
    page: '#f4f5f9',
    white: '#ffffff',
    ink: '#171a21',
    muted: '#50555f',
    blue: '#154b7f',
    blueSoft: '#2f679d',
    green: '#2baf6f',
    lightBlue: '#87d3f8',
    skyBlue: '#e8f0f8',
    testimonialBg: '#6485cd',
};

// Product data
const PRODUCTS = [
    { id: '1', name: "Charlie's Choice", img: 'Charlie-s-Choice-69c01614331a4.jpg', price: '150.00', desc: '72% salmon', rating: 4.8, reviews: 148 },
    { id: '2', name: 'Carriers', img: 'aesthetic-cage-69c0211ba9536.jpg', price: '699.00', desc: 'Hard travel', rating: 4.6, reviews: 92 },
    { id: '3', name: 'Grooming Set', img: 'AllPetSolutions-4-Piece-Dog-Grooming-Set-69c0202724f1d.jpg', price: '200.00', desc: '4-piece kit', rating: 4.7, reviews: 75 },
    { id: '4', name: 'Dental Chews', img: 'Bark-Bright-69c01f8975e9c.jpg', price: '199.00', desc: 'Chicken-based', rating: 4.9, reviews: 164 },
    { id: '5', name: 'Harness Set', img: 'Blue-dog-harness-69c0208b5c230.jpg', price: '500.00', desc: 'Walking kit', rating: 4.5, reviews: 66 },
    { id: '6', name: 'Pet Wipes', img: 'pet-wipes-69c03c6755705.jpg', price: '50.00', desc: 'Gentle clean', rating: 4.4, reviews: 58 },
    { id: '7', name: 'Salmon Food', img: 'Loveabowl-Salmon-Dry-Cat-Food-69c03c1984b88.jpg', price: '99.00', desc: 'Grain-free', rating: 4.8, reviews: 139 },
    { id: '8', name: 'Shower Cup', img: 'Pet-Feet-Shower-Cup-69c03cdff0f0a.jpg', price: '144.00', desc: 'Paw cleaner', rating: 4.3, reviews: 44 },
];

const TEAM_MEMBERS = [
    { id: '1', name: 'Khricia Divino', role: 'Founder & CEO' },
    { id: '2', name: 'Jimwella De Guzman', role: 'Product Director' },
    { id: '3', name: 'Rhea Amor Delejero', role: 'Customer Success Lead' },
    { id: '4', name: 'Vincent Delostrico', role: 'Operations Manager' },
];

const GALLERY_ITEMS = [
    { id: '1', img: 'gallery8.jpg', color: COLORS.lightBlue, title: 'HUMAN!', subtitle: 'YOU NEED ME' },
    { id: '2', img: 'gallery6.jpg', color: COLORS.testimonialBg, title: 'ADOPT A', subtitle: 'FRIEND' },
    { id: '3', img: 'gallery7.jpg', color: COLORS.lightBlue, title: 'TRUE BEST', subtitle: 'FRIEND' },
    { id: '4', img: 'gallery10.jpg', color: COLORS.testimonialBg, title: 'PARTNER', subtitle: 'OF LIFE' },
    { id: '5', img: 'gallery11.jpg', color: COLORS.lightBlue, title: 'PUPPY IS', subtitle: 'THE ANSWER' },
];

const TESTIMONIALS = [
    { id: '1', rating: 5, quote: 'Inventory is finally easy to track', message: 'Before PawStuff we missed low-stock alerts. Now restocks are on time!', author: 'James Cameron' },
    { id: '2', rating: 5, quote: 'Dashboard gave us better control', message: 'Everything feels connected. Helps us make decisions quickly.', author: 'Liam Harper' },
    { id: '3', rating: 5, quote: 'Support is responsive and helpful', message: 'Got clear answers fast. Platform is built for real operations.', author: 'Sophia Reyes' },
    { id: '4', rating: 5, quote: 'Front desk process is smoother', message: 'Daily flow is cleaner. PawStuff saves us hours weekly!', author: 'Noah Bennett' },
];

const getProductImage = (img: string) => {
    const images: { [key: string]: any } = {
        'Charlie-s-Choice-69c01614331a4.jpg': require('../assets/images/Charlie-s-Choice-69c01614331a4.jpg'),
        'aesthetic-cage-69c0211ba9536.jpg': require('../assets/images/aesthetic-cage-69c0211ba9536.jpg'),
        'AllPetSolutions-4-Piece-Dog-Grooming-Set-69c0202724f1d.jpg': require('../assets/images/AllPetSolutions-4-Piece-Dog-Grooming-Set-69c0202724f1d.jpg'),
        'Bark-Bright-69c01f8975e9c.jpg': require('../assets/images/Bark-Bright-69c01f8975e9c.jpg'),
        'Blue-dog-harness-69c0208b5c230.jpg': require('../assets/images/Blue-dog-harness-69c0208b5c230.jpg'),
        'pet-wipes-69c03c6755705.jpg': require('../assets/images/pet-wipes-69c03c6755705.jpg'),
        'Loveabowl-Salmon-Dry-Cat-Food-69c03c1984b88.jpg': require('../assets/images/Loveabowl-Salmon-Dry-Cat-Food-69c03c1984b88.jpg'),
        'Pet-Feet-Shower-Cup-69c03cdff0f0a.jpg': require('../assets/images/Pet-Feet-Shower-Cup-69c03cdff0f0a.jpg'),
    };
    return images[img] || require('../assets/images/logo.png');
};

const getTeamImage = (name: string) => {
    const images: { [key: string]: any } = {
        'Khricia Divino': require('../assets/images/KhriciaDivino.jpg'),
        'Jimwella De Guzman': require('../assets/images/Jim.jpg'),
        'Rhea Amor Delejero': require('../assets/images/Rhea.png'),
        'Vincent Delostrico': require('../assets/images/vincent.png'),
    };
    return images[name] || require('../assets/images/logo.png');
};

const getGalleryImage = (img: string) => {
    const images: { [key: string]: any } = {
        'gallery6.jpg': require('../assets/images/gallery6.jpg'),
        'gallery7.jpg': require('../assets/images/gallery7.jpg'),
        'gallery8.jpg': require('../assets/images/gallery8.jpg'),
        'gallery10.jpg': require('../assets/images/gallery10.jpg'),
        'gallery11.jpg': require('../assets/images/gallery11.jpg'),
    };
    return images[img] || require('../assets/images/logo.png');
};

const LandingScreen: FC = () => {
    const navigation = useNavigation<any>();

    const navigateTo = (screen: string) => {
        navigation.navigate(screen);
    };

    const renderProductCard = ({ item }: any) => (
        <View style={[styles.productCard, { backgroundColor: item.id === '1' || item.id === '3' || item.id === '5' || item.id === '7' ? COLORS.lightBlue : COLORS.white }]}>
            <Image
                source={getProductImage(item.img)}
                style={{ width: 100, height: 100, marginBottom: 8, borderRadius: 6 }}
                resizeMode="contain"
            />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productDesc}>{item.desc}</Text>
            <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Text key={i} style={[styles.star, { color: i <= Math.floor(item.rating) ? '#f4b740' : '#c9d3de' }]}>
                        ★
                    </Text>
                ))}
                <Text style={styles.reviewText}>{item.rating.toFixed(1)} ({item.reviews})</Text>
            </View>
            <Text style={styles.productPrice}>₱{item.price}</Text>
        </View>
    );

    const renderTeamMember = ({ item }: any) => (
        <View style={styles.teamCard}>
            <Image
                source={getTeamImage(item.name)}
                style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 8 }}
                resizeMode="cover"
            />
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.teamRole}>{item.role}</Text>
        </View>
    );

    const renderTestimonial = ({ item }: any) => (
        <View style={styles.testimonialCard}>
            <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Text key={i} style={styles.starFilled}>★</Text>
                ))}
            </View>
            <Text style={styles.testimonialQuote}>"{item.quote}"</Text>
            <Text style={styles.testimonialMessage}>{item.message}</Text>
            <Text style={styles.testimonialAuthor}>— {item.author}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Banner */}
            <View style={styles.banner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroLabel}>At PawStuff</Text>
                    <Text style={styles.heroTitle}>We make pet care simple.</Text>
                    <Text style={styles.heroSubtitle}>Quality supplies, happy pets, wagging tails.</Text>
                    <Text style={styles.heroDescription}>
                        We believe every pet deserves the best. From premium nutrition to playful toys and cozy essentials, we carefully curate products that keep tails wagging.
                    </Text>
                    <TouchableOpacity style={styles.shopButton} onPress={() => navigateTo(SCREENS.LOGIN)}>
                        <Text style={styles.shopButtonText}>Shop Now</Text>
                    </TouchableOpacity>
                </View>

                <Image
                    source={require('../assets/images/ddog2-removebg-preview.png')}
                    style={{ position: 'absolute', right: -10, bottom: 0, width: '50%', height: '75%', opacity: 0.8 }}
                    resizeMode="contain"
                />
                <Image
                    source={require('../assets/images/cat1-removebg-preview.png')}
                    style={{ position: 'absolute', left: -10, bottom: 0, width: '45%', height: '60%', opacity: 0.8 }}
                    resizeMode="contain"
                />
            </View>

            {/* Team Section */}
            <View style={styles.teamSection}>
                <Text style={styles.sectionTitleLight}>Meet Our Team</Text>
                <Text style={styles.teamSubtitle}>
                    Our passionate team is dedicated to delivering the best products and service for pet owners everywhere.
                </Text>

                <FlatList
                    data={TEAM_MEMBERS}
                    renderItem={renderTeamMember}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.teamGrid}
                    style={styles.teamList}
                />

                <TouchableOpacity style={styles.learnMoreButton} onPress={() => navigateTo(SCREENS.ABOUT)}>
                    <Text style={styles.learnMoreText}>Learn More About Us</Text>
                </TouchableOpacity>
            </View>

            {/* Products Section */}
            <View style={styles.productsSection}>
                <Text style={styles.sectionTitle}>Browse Products</Text>
                <FlatList
                    data={PRODUCTS}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={true}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productsList}
                    snapToInterval={width * 0.70}
                    snapToAlignment="start"
                    decelerationRate="fast"
                />
            </View>

            {/* Gallery Section */}
            <View style={styles.gallerySection}>
                <Text style={styles.galleryLabel}>Our Collection</Text>
                <Text style={styles.galleryTitle}>Happy Paws, Happy Moments</Text>

                <FlatList
                    data={GALLERY_ITEMS}
                    renderItem={({ item }) => (
                        <View style={[styles.galleryCard, { backgroundColor: item.color }]}>
                            <Text style={styles.galleryCardTitle}>{item.title}</Text>
                            <Text style={styles.galleryCardSubtitle}>{item.subtitle}</Text>
                            <Image
                                source={getGalleryImage(item.img)}
                                style={{ width: '75%', height: 100 }}
                                resizeMode="contain"
                            />
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={true}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.galleryList}
                    snapToInterval={width * 0.75}
                    snapToAlignment="start"
                    decelerationRate="fast"
                />
            </View>

            {/* Why Choose Us */}
            <View style={styles.whyChooseSection}>
                <Text style={styles.sectionTitle}>Why Choose PawStuff?</Text>

                <View style={styles.whyChooseContent}>
                    <Image
                        source={require('../assets/images/catdog-removebg-preview.png')}
                        style={{ width: 120, height: 120 }}
                        resizeMode="contain"
                    />

                    <View style={styles.whyChooseBenefits}>
                        <Text style={styles.whyChooseHeading}>Efficiency meets empathy.</Text>
                        <Text style={styles.whyChooseDesc}>
                            We help pet parents run smarter with dependable tools and thoughtful support.
                        </Text>

                        <View style={styles.benefitsList}>
                            <View style={styles.benefitItem}>
                                <View style={styles.benefitCheck}><Text style={styles.checkmark}>✓</Text></View>
                                <Text style={styles.benefitText}>Trusted Product Quality</Text>
                            </View>

                            <View style={styles.benefitItem}>
                                <View style={styles.benefitCheck}><Text style={styles.checkmark}>✓</Text></View>
                                <Text style={styles.benefitText}>Data-Driven Store Management</Text>
                            </View>

                            <View style={styles.benefitItem}>
                                <View style={styles.benefitCheck}><Text style={styles.checkmark}>✓</Text></View>
                                <Text style={styles.benefitText}>Fast, Human-Centered Support</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Testimonials */}
            <View style={styles.testimonialSection}>
                <Text style={styles.testimonialTitle}>Customer Testimonials</Text>
                <Text style={styles.testimonialSubtitle}>
                    Real feedback from pet parents using PawStuff every day.
                </Text>

                <FlatList
                    data={TESTIMONIALS}
                    renderItem={renderTestimonial}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={true}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.testimonialsList}
                    snapToInterval={width * 0.80}
                    snapToAlignment="start"
                    decelerationRate="fast"
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerBrand}>PawStuff</Text>
                <Text style={styles.footerTagline}>
                    Making pet care simple for everyone, one wagging tail at a time.
                </Text>

                <View style={styles.footerLinks}>
                    <TouchableOpacity onPress={() => navigateTo(SCREENS.LANDING)}>
                        <Text style={styles.footerLink}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo(SCREENS.ABOUT)}>
                        <Text style={styles.footerLink}>About Us</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigateTo(SCREENS.LOGIN)}>
                        <Text style={styles.footerLink}>Products</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerCopyright}>© 2024 PawStuff. All rights reserved.</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: { flex: 1, backgroundColor: COLORS.page },

    // BANNER
    banner: { minHeight: height * 0.7, backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 24, justifyContent: 'center' },
    heroContent: { zIndex: 2, marginBottom: 20 },
    heroLabel: { fontSize: 11, fontWeight: '700', color: '#1a4d80', marginBottom: 6, letterSpacing: 0.5 },
    heroTitle: { fontSize: 24, fontWeight: '900', color: COLORS.ink, lineHeight: 30, marginBottom: 4, letterSpacing: -0.5 },
    heroSubtitle: { fontSize: 18, fontWeight: '800', color: COLORS.blue, lineHeight: 24, marginBottom: 12 },
    heroDescription: { fontSize: 13, color: COLORS.muted, lineHeight: 20, marginBottom: 16 },
    shopButton: { backgroundColor: COLORS.green, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 22, alignSelf: 'flex-start' },
    shopButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },

    // TEAM SECTION
    teamSection: { backgroundColor: COLORS.blue, paddingVertical: 32, paddingHorizontal: 16, alignItems: 'center' },
    sectionTitleLight: { fontSize: 24, fontWeight: '900', color: COLORS.white, marginBottom: 12, textAlign: 'center' },
    teamSubtitle: { fontSize: 13, color: COLORS.skyBlue, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    teamList: { width: '100%', marginBottom: 24 },
    teamGrid: { justifyContent: 'space-between', marginBottom: 12, gap: 10 },
    teamCard: { width: '48%', backgroundColor: COLORS.blueSoft, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center' },
    teamName: { fontSize: 12, fontWeight: '700', color: COLORS.white, marginBottom: 3, textAlign: 'center' },
    teamRole: { fontSize: 11, color: COLORS.skyBlue, textAlign: 'center' },
    learnMoreButton: { backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 22 },
    learnMoreText: { color: COLORS.blue, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },

    // PRODUCTS SECTION
    productsSection: { paddingVertical: 28, paddingHorizontal: 16, backgroundColor: COLORS.white },
    sectionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.blue, marginBottom: 18, textAlign: 'center' },
    productsList: { paddingHorizontal: 6 },
    productCard: { width: width * 0.65, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 10, marginHorizontal: 6, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
    productName: { fontSize: 13, fontWeight: '700', color: COLORS.blue, marginBottom: 3, textAlign: 'center' },
    productDesc: { fontSize: 11, color: COLORS.muted, marginBottom: 6, textAlign: 'center' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, justifyContent: 'center' },
    star: { fontSize: 11, marginHorizontal: 1 },
    reviewText: { fontSize: 10, color: COLORS.muted, marginLeft: 3, fontWeight: '600' },
    productPrice: { fontSize: 16, fontWeight: '800', color: COLORS.green, marginTop: 6 },

    // GALLERY SECTION
    gallerySection: { paddingVertical: 28, paddingHorizontal: 16, backgroundColor: COLORS.white },
    galleryLabel: { fontSize: 11, color: COLORS.blue, fontWeight: '700', textAlign: 'center', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase' },
    galleryTitle: { fontSize: 20, fontWeight: '900', color: COLORS.ink, textAlign: 'center', marginBottom: 18 },
    galleryList: { paddingHorizontal: 6 },
    galleryCard: { width: width * 0.72, marginHorizontal: 6, borderRadius: 10, paddingVertical: 18, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
    galleryCardTitle: { fontSize: 16, fontWeight: '900', color: COLORS.blue, textAlign: 'center', lineHeight: 20 },
    galleryCardSubtitle: { fontSize: 11, fontWeight: '700', color: COLORS.blueSoft, textAlign: 'center', marginBottom: 10 },

    // WHY CHOOSE SECTION
    whyChooseSection: { paddingVertical: 28, paddingHorizontal: 16, backgroundColor: COLORS.skyBlue },
    whyChooseContent: { flexDirection: 'column', alignItems: 'center', marginTop: 20, gap: 16 },
    whyChooseBenefits: { width: '100%' },
    whyChooseHeading: { fontSize: 18, fontWeight: '800', color: COLORS.ink, marginBottom: 10, lineHeight: 24, textAlign: 'center' },
    whyChooseDesc: { fontSize: 13, color: COLORS.muted, lineHeight: 19, marginBottom: 16, textAlign: 'center' },
    benefitsList: { gap: 10 },
    benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    benefitCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(31, 95, 154, 0.15)', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    checkmark: { color: COLORS.blue, fontSize: 12, fontWeight: '700' },
    benefitText: { fontSize: 13, fontWeight: '600', color: COLORS.ink, flex: 1 },

    // TESTIMONIALS SECTION
    testimonialSection: { paddingVertical: 28, paddingHorizontal: 14, backgroundColor: COLORS.testimonialBg, borderRadius: 14, marginHorizontal: 12, marginVertical: 18 },
    testimonialTitle: { fontSize: 20, fontWeight: '900', color: COLORS.white, marginBottom: 6 },
    testimonialSubtitle: { fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 18, lineHeight: 18 },
    testimonialsList: { paddingHorizontal: 4 },
    testimonialCard: { width: width * 0.78, backgroundColor: '#7a92d9', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 12, marginHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
    starRow: { flexDirection: 'row', marginBottom: 6 },
    starFilled: { color: '#f4b740', fontSize: 12, marginRight: 2 },
    testimonialQuote: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginVertical: 6, lineHeight: 18 },
    testimonialMessage: { fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 16, marginBottom: 6, fontStyle: 'italic' },
    testimonialAuthor: { fontSize: 11, fontWeight: '600', color: 'rgba(255, 255, 255, 0.85)', marginTop: 6 },

    // FOOTER
    footer: { backgroundColor: COLORS.ink, paddingVertical: 24, paddingHorizontal: 16, marginTop: 24, alignItems: 'center' },
    footerBrand: { fontSize: 16, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
    footerTagline: { fontSize: 12, color: '#94a3b8', lineHeight: 18, marginBottom: 14, textAlign: 'center' },
    footerLinks: { flexDirection: 'row', gap: 14, marginBottom: 14 },
    footerLink: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    footerCopyright: { fontSize: 10, color: '#64748b', textAlign: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
});

export default LandingScreen;
