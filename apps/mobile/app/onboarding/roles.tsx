import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocale } from '@pranora/i18n';
import type { UserRole, VerificationStatus } from '@pranora/types';

interface RoleOption {
  role: UserRole;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  icon: string;
  requiresVerification: boolean;
}

const AVAILABLE_ROLES: RoleOption[] = [
  {
    role: 'owner',
    titleBn: 'পোষা প্রাণীর মালিক',
    titleEn: 'Pet Owner',
    descBn: 'নিজের পোষা প্রাণীর প্রোফাইল, টিকার রেকর্ড ও ডাক্তারের সিরিয়াল নিন',
    descEn: 'Manage pet health, vaccines, and book vet appointments',
    icon: '🐾',
    requiresVerification: false,
  },
  {
    role: 'rescuer',
    titleBn: 'উদ্ধারকারী',
    titleEn: 'Animal Rescuer',
    descBn: 'আহত বা বিপন্ন প্রাণীর উদ্ধারের ডাক গ্রহণ ও পরিচালনা করুন',
    descEn: 'Receive urgent rescue calls and handle animal rescue cases',
    icon: '🚑',
    requiresVerification: true,
  },
  {
    role: 'shelter',
    titleBn: 'আশ্রয়স্থল / শেল্টার',
    titleEn: 'Animal Shelter',
    descBn: 'উদ্ধারকৃত প্রাণীদের আশ্রয়, দত্তকের তালিকা ও আবেদন পরিচালনা করুন',
    descEn: 'List rescued animals for adoption and manage applications',
    icon: '🏡',
    requiresVerification: true,
  },
  {
    role: 'vet',
    titleBn: 'পশু চিকিৎসক',
    titleEn: 'Veterinarian (DVM)',
    descBn: 'ক্লিনিকের সময়সূচি, প্রেসক্রিপশন ও অনলাইন পরামর্শ সেবা দিন',
    descEn: 'Manage clinical schedule, prescriptions, and consultations',
    icon: '🩺',
    requiresVerification: true,
  },
  {
    role: 'provider',
    titleBn: 'সেবা প্রদানকারী',
    titleEn: 'Service Provider',
    descBn: 'গ্রুমিং, প্রশিক্ষণ, হোস্টেল ও পোষা প্রাণীর পণ্য সামগ্রী সেবা',
    descEn: 'Pet grooming, training, boarding, or pet supply services',
    icon: '✂️',
    requiresVerification: true,
  },
];

export default function MobileRolesScreen() {
  const { isBangla } = useLocale();

  const [userRoles, setUserRoles] = useState<{ role: UserRole; status: VerificationStatus }[]>([
    { role: 'owner', status: 'verified' },
  ]);
  const [activeRole, setActiveRole] = useState<UserRole>('owner');
  const [requestingRole, setRequestingRole] = useState<UserRole | null>(null);
  const [regNo, setRegNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRoleOwned = (role: UserRole) => userRoles.some((r) => r.role === role);
  const getRoleStatus = (role: UserRole): VerificationStatus | null => {
    const found = userRoles.find((r) => r.role === role);
    return found ? found.status : null;
  };

  const handleRolePress = (opt: RoleOption) => {
    if (isRoleOwned(opt.role)) {
      if (getRoleStatus(opt.role) === 'verified') {
        setActiveRole(opt.role);
      }
      return;
    }

    if (opt.requiresVerification) {
      setRequestingRole(opt.role);
    } else {
      setUserRoles((prev) => [...prev, { role: opt.role, status: 'verified' }]);
      setActiveRole(opt.role);
    }
  };

  const handleSubmitVerification = () => {
    if (!requestingRole) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setUserRoles((prev) => [
        ...prev.filter((r) => r.role !== requestingRole),
        { role: requestingRole, status: 'pending' },
      ]);
      setRequestingRole(null);
      setRegNo('');
    }, 600);
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50/50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-4xl mb-2">👥</Text>
          <Text className="text-2xl font-bold text-green-900 mb-1 text-center">
            {isBangla ? 'আপনার ভূমিকা ও পরিচয়' : 'Your Roles & Identity'}
          </Text>
          <Text className="text-xs text-gray-600 text-center px-4 leading-relaxed">
            {isBangla
              ? 'প্রাণোরায় আপনি একই সাথে একাধিক ভূমিকা বেছে নিতে পারবেন।'
              : 'Hold multiple roles on Pranora and switch between them anytime.'}
          </Text>
        </View>

        {/* Active Role Card */}
        <View className="bg-white p-4 rounded-2xl border border-green-200 mb-6 shadow-xs">
          <Text className="text-xs text-gray-500 font-semibold mb-1">
            {isBangla ? 'বর্তমান সক্রিয় ভূমিকা' : 'Current Active Role'}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">
                {AVAILABLE_ROLES.find((r) => r.role === activeRole)?.icon}
              </Text>
              <Text className="text-lg font-bold text-green-900">
                {isBangla
                  ? AVAILABLE_ROLES.find((r) => r.role === activeRole)?.titleBn
                  : AVAILABLE_ROLES.find((r) => r.role === activeRole)?.titleEn}
              </Text>
            </View>
            <View className="bg-green-600 px-2 py-0.5 rounded-full">
              <Text className="text-white text-xs font-bold">{isBangla ? 'সক্রিয়' : 'Active'}</Text>
            </View>
          </View>
        </View>

        {/* Roles List */}
        <View className="space-y-3 mb-6">
          {AVAILABLE_ROLES.map((opt) => {
            const owned = isRoleOwned(opt.role);
            const status = getRoleStatus(opt.role);
            const isCurrentActive = activeRole === opt.role;

            return (
              <TouchableOpacity
                key={opt.role}
                onPress={() => handleRolePress(opt)}
                activeOpacity={0.8}
                className={`p-4 rounded-2xl border mb-3 bg-white ${
                  isCurrentActive ? 'border-green-600 bg-green-50/40' : 'border-gray-200'
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center gap-3 flex-1 mr-2">
                    <Text className="text-2xl">{opt.icon}</Text>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Text className="text-base font-bold text-gray-900">
                          {isBangla ? opt.titleBn : opt.titleEn}
                        </Text>
                        {status === 'verified' && (
                          <View className="bg-green-100 px-2 py-0.5 rounded-full">
                            <Text className="text-green-800 text-xs font-bold">
                              ✓ {isBangla ? 'যাচাইকৃত' : 'Verified'}
                            </Text>
                          </View>
                        )}
                        {status === 'pending' && (
                          <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                            <Text className="text-amber-800 text-xs font-bold">
                              ⏳ {isBangla ? 'অপেক্ষামান' : 'Pending'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {isBangla ? opt.descBn : opt.descEn}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-1">
                    {owned && status === 'verified' ? (
                      <View
                        className={`px-3 py-1.5 rounded-xl ${
                          isCurrentActive ? 'bg-green-700' : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isCurrentActive ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {isCurrentActive
                            ? isBangla ? 'সক্রিয়' : 'Active'
                            : isBangla ? 'সুইচ' : 'Switch'}
                        </Text>
                      </View>
                    ) : (
                      <View className="px-3 py-1.5 rounded-xl bg-green-100">
                        <Text className="text-xs font-bold text-green-800">
                          {opt.requiresVerification
                            ? isBangla ? 'আবেদন' : 'Apply'
                            : isBangla ? 'যোগ' : 'Add'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Verification Modal */}
        <Modal visible={Boolean(requestingRole)} transparent animationType="fade">
          <View className="flex-1 bg-black/50 justify-center p-6">
            <View className="bg-white p-6 rounded-3xl">
              <Text className="text-lg font-bold text-gray-900 mb-2">
                {isBangla ? 'যাচাইকরণের আবেদন' : 'Verification Request'}
              </Text>
              <Text className="text-xs text-gray-500 mb-4 leading-relaxed">
                {isBangla
                  ? 'আপনার লাইসেন্স বা পরিচয়পত্র নম্বর দিন:'
                  : 'Enter your registration or identification number:'}
              </Text>

              <TextInput
                value={regNo}
                onChangeText={setRegNo}
                placeholder="Registration / License No"
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 mb-4"
              />

              <View className="flex-row items-center justify-end gap-3">
                <TouchableOpacity
                  onPress={() => setRequestingRole(null)}
                  className="px-4 py-2"
                >
                  <Text className="text-gray-600 font-bold">
                    {isBangla ? 'বাতিল' : 'Cancel'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmitVerification}
                  disabled={isSubmitting || !regNo.trim()}
                  className="px-5 py-2.5 bg-green-700 rounded-xl items-center"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-sm">
                      {isBangla ? 'জমা দিন' : 'Submit'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
