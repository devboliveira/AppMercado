import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../global/types';

export async function getRegister(key: string): Promise<User | null> {
  const stored = await AsyncStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Erro ao ler o registro:', e);
    return null;
  }
}

export async function clearRegister(key: string) {
  await AsyncStorage.removeItem(key);
}
