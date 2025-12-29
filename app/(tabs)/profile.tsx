import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Theme';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: '1',
      icon: 'person-outline',
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      onPress: () => Alert.alert('Coming Soon', 'This feature is under development'),
    },
    {
      id: '2',
      icon: 'card-outline',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      onPress: () => Alert.alert('Coming Soon', 'This feature is under development'),
    },
    {
      id: '3',
      icon: 'document-text-outline',
      title: 'Investment Documents',
      subtitle: 'View contracts and agreements',
      onPress: () => Alert.alert('Coming Soon', 'This feature is under development'),
    },
    {
      id: '4',
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Configure alert preferences',
      onPress: () => Alert.alert('Coming Soon', 'This feature is under development'),
    },
    {
      id: '5',
      icon: 'shield-checkmark-outline',
      title: 'Security',
      subtitle: 'Password and authentication',
      onPress: () => Alert.alert('Coming Soon', 'This feature is under development'),
    },
    {
      id: '6',
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get assistance with your account',
      onPress: () => Alert.alert('Coming Soon', 'This feature is under development'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerTitleGold}>My </Text>
          <Text style={styles.headerTitleBlack}>Profile</Text>
        </Text>
        <Text style={styles.headerSubtitle}>Manage Your Account</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={Colors.pureWhite} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Demo User</Text>
            <Text style={styles.userEmail}>demo@towertrade.com</Text>
          </View>
        </View>

        {/* Account Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Active Investments</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>$285K</Text>
            <Text style={styles.statLabel}>Portfolio Value</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color={Colors.towerGold} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="business" size={24} color={Colors.textSecondary} />
          <Text style={styles.footerText}>TowerTrade v1.0.0</Text>
          <Text style={styles.footerSubtext}>Premium Real Estate Crowdfunding</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pureWhite,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.heading1,
    marginBottom: Spacing.xs,
  },
  headerTitleGold: {
    color: Colors.towerGold,
    fontWeight: Typography.bold,
  },
  headerTitleBlack: {
    color: Colors.ebonyBlack,
    fontWeight: Typography.bold,
  },
  headerSubtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.towerGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.heading3,
    fontWeight: Typography.bold,
    color: Colors.ebonyBlack,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.softSlate,
    marginHorizontal: Spacing.md,
  },
  statValue: {
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
    color: Colors.towerGold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.softSlate,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFF9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.ebonyBlack,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.pureWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    fontSize: Typography.body,
    fontWeight: Typography.semiBold,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  footerSubtext: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
