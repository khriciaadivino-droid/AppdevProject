import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { resetLogin } from '../app/reducers/auth';



const HomeScreen = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(resetLogin());
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default HomeScreen;
