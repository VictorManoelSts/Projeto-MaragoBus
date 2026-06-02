import React from 'react';
import {
  View, Text, Image, StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Colors } from '../constants/theme';
import { logout } from '../services/auth.service';
import { AppHeader } from '../components/AppHeader';
import type {
  RootStackParamList,
  AlunoTabParamList,
  AdminTabParamList,
  Aluno,
  Admin,
} from '../types/Index';
 
import { LoginScreen }       from '../screens/auth/LoginScreen';
import { ReservaScreen }     from '../screens/aluno/ReservaScreen';
import { ComprovanteScreen } from '../screens/aluno/ComprovanteScreen';
import { MotoristaScreen }   from '../screens/motorista/MotoristaScreen';
import { ReservasScreen }    from '../screens/admin/ReservasScreen';
import { AlunosScreen }      from '../screens/admin/AlunosScreen';
import { MotoristasScreen }  from '../screens/admin/MotoristasScreen';
import { CadastroScreen }    from '../screens/admin/CadastroScreen';
 
const logo = require('../../assets/logo-Maragogi.png');
 
// ─── Stacks / Tabs ───────────────────────────────────────────────────────────
const RootStack  = createNativeStackNavigator<RootStackParamList>();
const AlunoTab   = createBottomTabNavigator<AlunoTabParamList>();
const AdminTab   = createBottomTabNavigator<AdminTabParamList>();
 
// ─── Logo header centralizada (usada nos Tab navigators) ─────────────────────
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
const AlunoNavigator: React.FC<{ aluno: Aluno; onLogout: () => void }> = ({ aluno, onLogout }) => (
  <AlunoTab.Navigator
    screenOptions={{
      tabBarActiveTintColor:   Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: { borderTopColor: Colors.border },
      headerTitle: () => <LogoHeader />,
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: Colors.white },
      headerShadowVisible: false,
    }}
  >
    <AlunoTab.Screen
      name="Reserva"
      options={{ tabBarLabel: 'Reserva', tabBarIcon: ({ color }) => <TabIcon icon="🎫" color={color} /> }}
    >
      {(props) => <ReservaScreen {...props} route={{ ...props.route, params: { aluno } }} />}
    </AlunoTab.Screen>
 
    <AlunoTab.Screen
      name="Comprovante"
      options={{ tabBarLabel: 'Comprovante', tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} /> }}
    >
      {(props) => <ComprovanteScreen {...props} route={{ ...props.route, params: { aluno, reserva: null } }} />}
    </AlunoTab.Screen>
  </AlunoTab.Navigator>
);
 
// ─── Admin Tabs ──────────────────────────────────────────────────────────────
const AdminNavigator: React.FC<{ admin: Admin; onLogout: () => void }> = ({ admin, onLogout }) => {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        titulo="Administrador"
        nomeUsuario={admin.nome.split(' ')[0]}
        onLogout={handleLogout}
        exibirLogo={true}
      />
      <AdminTab.Navigator
        screenOptions={{
          headerShown:             false,
          tabBarActiveTintColor:   Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle:             { borderTopColor: Colors.border },
        }}
      >
        <AdminTab.Screen
          name="AdminReservas"
          component={ReservasScreen}
          options={{ tabBarLabel: 'Reservas', tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} /> }}
        />
        <AdminTab.Screen
          name="AdminAlunos"
          component={AlunosScreen}
          options={{ tabBarLabel: 'Alunos', tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} /> }}
        />
        <AdminTab.Screen
          name="AdminMotoristas"
          component={MotoristasScreen}
          options={{ tabBarLabel: 'Motoristas', tabBarIcon: ({ color }) => <TabIcon icon="🚌" color={color} /> }}
        />
        <AdminTab.Screen
          name="AdminCadastro"
          component={CadastroScreen}
          options={{ tabBarLabel: 'Cadastrar', tabBarIcon: ({ color }) => <TabIcon icon="➕" color={color} /> }}
        />
      </AdminTab.Navigator>
    </View>
  );
};
 
// ─── Ícone de aba ─────────────────────────────────────────────────────────────
const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => (
  <Text style={{ fontSize: 20 }}>{icon}</Text>
);
 
// ─── Root Navigator ───────────────────────────────────────────────────────────
export const AppNavigator: React.FC = () => (
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
        {({ route, navigation }) => (
          <AdminNavigator
            admin={route.params.admin}
            onLogout={() => navigation.replace('Login')}
          />
        )}
      </RootStack.Screen>
    </RootStack.Navigator>
  </NavigationContainer>
);
 
