// Powered by OnSpace.AI
import { useContext } from 'react';
import { RestaurantContext } from '@/contexts/RestaurantContext';

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within RestaurantProvider');
  return context;
}
