import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { Package, Plus } from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchWithTimeout, getApiBaseUrl } from '../../src/lib/api';
import { stitchColors } from '../../src/theme/stitch';

type OrderItem = {
  id: string;
  po_number: string;
  customer_name: string;
  brand_name: string;
  order_type: string;
  status: string;
  total_amount: number;
  created_at: string;
  items?: { id?: string }[];
};

const statusColor = (status: string) => {
  switch (String(status)) {
    case 'draft':
      return '#94A3B8';
    case 'pending':
      return '#F59E0B';
    case 'design':
      return '#3B82F6';
    case 'production':
      return '#8B5CF6';
    case 'completed':
      return '#10B981';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#64748B';
  }
};

export default function OrdersScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetchWithTimeout(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('[OrdersTab] fetch', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const renderItem = ({ item }: { item: OrderItem }) => {
    const n = item.items?.length ?? 0;
    return (
      <TouchableOpacity
        style={[tw`p-4 rounded-2xl mb-3`, { backgroundColor: '#fff', borderColor: stitchColors.borderLight, borderWidth: 1 }]}
        onPress={() => router.push(`/order/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={[tw`font-bold`, { color: stitchColors.textOnLight }]}>{item.po_number}</Text>
          <View style={[tw`px-2 py-1 rounded`, { backgroundColor: statusColor(item.status) + '30' }]}>
            <Text style={tw`text-white text-xs font-extrabold`}>{String(item.status).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={[tw``, { color: stitchColors.textOnLight }]}>
          {item.customer_name} — {item.brand_name}
        </Text>
        <Text style={[tw`text-sm mt-1`, { color: stitchColors.textMutedLight }]}>
          {item.order_type} · {n} item
        </Text>
        <View style={[tw`flex-row justify-between items-center mt-3 pt-3 border-t`, { borderColor: stitchColors.borderLight }]}>
          <Text style={[tw`font-bold`, { color: stitchColors.primary }]}>
            Rp {Number(item.total_amount).toLocaleString('id-ID')}
          </Text>
          <Text style={[tw`text-xs`, { color: stitchColors.textMutedLight }]}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: stitchColors.pageSoft }]}>
        <ActivityIndicator size="large" color={stitchColors.primary} />
      </View>
    );
  }

  return (
    <View style={[tw`flex-1 pt-12`, { backgroundColor: stitchColors.pageSoft }]}>
      <View style={tw`px-6 mb-4 flex-row justify-between items-center`}>
        <Text style={[tw`text-2xl font-bold`, { color: stitchColors.primary }]}>Pesanan</Text>
        <TouchableOpacity
          style={[tw`px-3 py-2 rounded-xl flex-row items-center`, { backgroundColor: stitchColors.primary }]}
          onPress={() => router.push('/order/create' as any)}
        >
          <Plus size={18} color="white" />
          <Text style={tw`text-white font-bold ml-1`}>Baru</Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <Package size={48} color={stitchColors.textMutedLight} style={tw`mb-4`} />
          <Text style={[tw`text-center mb-6`, { color: stitchColors.textMutedLight }]}>Belum ada pesanan.</Text>
          <TouchableOpacity
            style={[tw`px-6 py-3 rounded-xl`, { borderColor: stitchColors.primary, borderWidth: 1 }]}
            onPress={() => router.push('/order/create' as any)}
          >
            <Text style={[tw`font-bold`, { color: stitchColors.primary }]}>Buat order</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={tw`px-4 pb-10`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void fetchOrders();
              }}
              tintColor={stitchColors.primary}
            />
          }
        />
      )}
    </View>
  );
}
