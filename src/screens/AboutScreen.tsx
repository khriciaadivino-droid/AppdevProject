import React, { FC } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface TeamMember {
    id: number;
    name: string;
    role: string;
    icon: string;
}

const AboutScreen: FC = () => {
    const navigation = useNavigation<any>();

    const teamMembers: TeamMember[] = [
        { id: 1, name: 'Khricia Divino', role: 'Founder & CEO', icon: '👩‍💼' },
        { id: 2, name: 'Jimwella De Guzman', role: 'Product Director', icon: '👨‍💼' },
        { id: 3, name: 'Rhea Amor Delejero', role: 'Customer Success Lead', icon: '👩‍💼' },
        { id: 4, name: 'Vincent Delostrico', role: 'Operations Manager', icon: '👨‍💼' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About PawStuff</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.section}>
                    <Text style={styles.logo}>🐾</Text>
                    <Text style={styles.title}>About PawStuff</Text>

                    <Text style={styles.sectionText}>
                        PawStuff is a comprehensive pet management platform dedicated to helping pet owners manage their furry companions with ease and confidence.
                    </Text>

                    <Text style={styles.sectionText}>
                        Our mission is to provide a centralized hub where pet owners can track their pets' profiles, manage orders, and access premium pet services all in one place.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Values</Text>

                    <View style={styles.valueItem}>
                        <Text style={styles.valueIcon}>❤️</Text>
                        <View style={styles.valueContent}>
                            <Text style={styles.valueName}>Pet Welfare</Text>
                            <Text style={styles.valueDesc}>
                                We prioritize the health and happiness of pets
                            </Text>
                        </View>
                    </View>

                    <View style={styles.valueItem}>
                        <Text style={styles.valueIcon}>🤝</Text>
                        <View style={styles.valueContent}>
                            <Text style={styles.valueName}>Community</Text>
                            <Text style={styles.valueDesc}>
                                Building a supportive community of pet lovers
                            </Text>
                        </View>
                    </View>

                    <View style={styles.valueItem}>
                        <Text style={styles.valueIcon}>💡</Text>
                        <View style={styles.valueContent}>
                            <Text style={styles.valueName}>Innovation</Text>
                            <Text style={styles.valueDesc}>
                                Continuously improving our services
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Leadership Team</Text>

                    {teamMembers.map((member) => (
                        <View key={member.id} style={styles.teamCard}>
                            <Text style={styles.teamIcon}>{member.icon}</Text>
                            <View style={styles.teamInfo}>
                                <Text style={styles.teamName}>{member.name}</Text>
                                <Text style={styles.teamRole}>{member.role}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Get in Touch</Text>
                    <Text style={styles.contactText}>
                        Have questions? We'd love to hear from you!
                    </Text>
                    <TouchableOpacity style={styles.contactButton}>
                        <Text style={styles.contactButtonText}>Contact Us</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: { fontSize: 16, color: '#3B82F6', fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    content: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 40 },
    section: { marginBottom: 32 },
    logo: { fontSize: 60, textAlign: 'center', marginBottom: 16 },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    sectionText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
        marginBottom: 12,
    },
    valueItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    valueIcon: { fontSize: 24, marginRight: 12 },
    valueContent: { flex: 1 },
    valueName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    valueDesc: { fontSize: 13, color: '#6B7280' },
    teamCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    teamIcon: { fontSize: 32, marginRight: 12 },
    teamInfo: { flex: 1 },
    teamName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    teamRole: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    contactText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
    contactButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    contactButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default AboutScreen;
