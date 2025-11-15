import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  useEffect(() => {
    router.replace('/login');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
