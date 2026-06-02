import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors, Spacing } from './src/constants/theme';
import type {
  RootStackParamList,
  AlunoTabParamList,
  AdminTabParamList,
  Aluno,
} from './src/types/Index';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ReservaProvider } from './src/contexts/ReservaContext';

import { LoginScreen }      from './src/screens/auth/LoginScreen';
import { ReservaScreen }    from './src/screens/aluno/ReservaScreen';
import { ComprovanteScreen } from './src/screens/aluno/ComprovanteScreen';
import { MotoristaScreen }  from './src/screens/motorista/MotoristaScreen';
import { ReservasScreen }   from './src/screens/admin/ReservasScreen';
import { AlunosScreen }     from './src/screens/admin/AlunosScreen';
import { CadastroScreen }   from './src/screens/admin/CadastroScreen';

const logo = require('./src/assets/logo-Maragogi.png');

// ─── Stacks / Tabs ───────────────────────────────────────────────────────────
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AlunoTab  = createBottomTabNavigator<AlunoTabParamList>();
const AdminTab  = createBottomTabNavigator<AdminTabParamList>();

// ─── Logo header centralizada ─────────────────────────────────────────────────
const LogoHeader: React.FC = () => (
  <View style={hdrStyles.wrap}>
    <Image source={logo} style={hdrStyles.logo} resizeMode="contain" />
  </View>
);

const hdrStyles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 8 },
  logo: { height: 38, width: 160 },
});

// ─── Aluno Tabs ──────────────────────────────────────────────────────────────
const AlunoNavigator: React.FC<{ aluno: Aluno; onLogout: () => void }> = ({ aluno }) => (
  <ReservaProvider>
    <AlunoTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { borderTopColor: Colors.border },
        headerTitle: () => <LogoHeader />,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: Colors.white },
        headerShadowVisible: false,
      }}>
      <AlunoTab.Screen
        name="Reserva"
        options={{
          tabBarLabel: 'Reserva',
          tabBarIcon: ({ color }) => <TabIcon icon="🎫" color={color} />,
        }}>
        {(props) => (
          <ReservaScreen
            {...props}
            route={{ ...props.route, params: { aluno } }}
          />
        )}
      </AlunoTab.Screen>

      <AlunoTab.Screen
        name="Comprovante"
        options={{
          tabBarLabel: 'Comprovante',
          tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />,
        }}>
        {(props) => (
          <ComprovanteScreen
            {...props}
            route={{ ...props.route, params: { aluno, reserva: null } }}
          />
        )}
      </AlunoTab.Screen>
    </AlunoTab.Navigator>
  </ReservaProvider>
);

// ─── Admin Tabs ──────────────────────────────────────────────────────────────
const AdminNavigator: React.FC<{ onLogout: () => void }> = () => (
  <AdminTab.Navigator
    screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: { borderTopColor: Colors.border },
      headerTitle: () => <LogoHeader />,
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: Colors.white },
      headerShadowVisible: false,
    }}>
    <AdminTab.Screen
      name="AdminReservas"
      component={ReservasScreen}
      options={{
        tabBarLabel: 'Reservas',
        tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
      }}
    />
    <AdminTab.Screen
      name="AdminAlunos"
      component={AlunosScreen}
      options={{
        tabBarLabel: 'Alunos',
        tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
      }}
    />
    <AdminTab.Screen
      name="AdminCadastro"
      component={CadastroScreen}
      options={{
        tabBarLabel: 'Cadastrar',
        tabBarIcon: ({ color }) => <TabIcon icon="➕" color={color} />,
      }}
    />
  </AdminTab.Navigator>
);

// ─── Ícone de aba ─────────────────────────────────────────────────────────────
const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon }) => (
  <Text style={{ fontSize: 20 }}>{icon}</Text>
);

// ─── Tela de carregamento inicial ─────────────────────────────────────────────
const SplashScreen: React.FC = () => (
  <View style={splashStyles.wrap}>
    <Image source={logo} style={splashStyles.logo} resizeMode="contain" />
    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
  </View>
);

const splashStyles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primaryLight },
  logo: { height: 70, width: 200 },
});

// ─── Root Navigator ───────────────────────────────────────────────────────────
const AppNavigator: React.FC = () => {
  const { loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Login" component={LoginScreen} />

        <RootStack.Screen name="AlunoTabs">
          {({ route, navigation }) => (
            <AlunoNavigator
              aluno={route.params.aluno}
              onLogout={() => navigation.replace('Login')}
            />
          )}
        </RootStack.Screen>

        <RootStack.Screen name="MotoristaRoot">
          {({ navigation }) => (
            <MotoristaScreen
              navigation={navigation as any}
              route={{ key: '', name: 'MotoristaRoot', params: undefined } as any}
            />
          )}
        </RootStack.Screen>

        <RootStack.Screen name="AdminTabs">
          {({ navigation }) => (
            <AdminNavigator onLogout={() => navigation.replace('Login')} />
          )}
        </RootStack.Screen>
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// ─── Entry point ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
