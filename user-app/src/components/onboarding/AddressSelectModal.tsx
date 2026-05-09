import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { stitchColors } from '../../theme/stitch';

interface AddressSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: { id: string; nama: string }) => void;
  title: string;
  type: 'provinsi' | 'kota' | 'kecamatan' | 'kelurahan';
  parentId?: string;
}

export default function AddressSelectModal({
  visible,
  onClose,
  onSelect,
  title,
  type,
  parentId,
}: AddressSelectModalProps) {
  const [data, setData] = useState<{ id: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) {
      setSearch('');
      return;
    }
    fetchData();
  }, [visible, type, parentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '';
      if (type === 'provinsi') {
        url = 'https://ibnux.github.io/data-indonesia/provinsi.json';
      } else if (type === 'kota' && parentId) {
        url = `https://ibnux.github.io/data-indonesia/kabupaten/${parentId}.json`;
      } else if (type === 'kecamatan' && parentId) {
        url = `https://ibnux.github.io/data-indonesia/kecamatan/${parentId}.json`;
      } else if (type === 'kelurahan' && parentId) {
        url = `https://ibnux.github.io/data-indonesia/kelurahan/${parentId}.json`;
      }

      if (!url) {
        setData([]);
        setLoading(false);
        return;
      }

      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching address data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={`Cari ${title.toLowerCase()}...`}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={stitchColors.gold} />
            </View>
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={styles.itemText}>{item.nama}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Tidak ada data ditemukan</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#2D0A0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,168,71,0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: stitchColors.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  itemText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
});
