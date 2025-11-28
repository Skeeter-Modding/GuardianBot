import { Icon } from '@chakra-ui/react';
import { BsShieldCheck } from 'react-icons/bs';
import { FaBan, FaExclamationTriangle, FaGavel } from 'react-icons/fa';
import { IoWarning } from 'react-icons/io5';
import { MdSecurity, MdMessage } from 'react-icons/md';
import { useMusicFeature } from './example/MusicFeature';
import { FeaturesConfig, WelcomeMessageFeature } from './types';
import { provider } from 'config/translations/provider';
import { createI18n } from 'hooks/i18n';
import { useWelcomeMessageFeature } from './example/WelcomeMessageFeature';

/**
 * Support i18n (Localization)
 */
const { T } = createI18n(provider, {
  en: {
    moderation: 'Moderation',
    'moderation description': 'Advanced moderation tools and auto-moderation',
    warnings: 'Warning System',
    'warnings description': 'Track and manage user warnings',
    'auto mute': 'Auto Mute',
    'auto mute description': 'Automatically mute users after multiple warnings',
    security: 'Security',
    'security description': 'Server security features and anti-spam protection',
  },
  cn: {
    moderation: '管理工具',
    'moderation description': '高級管理工具和自動管理',
    warnings: '警告系統',
    'warnings description': '跟踪和管理用戶警告',
    'auto mute': '自動禁言',
    'auto mute description': '多次警告後自動禁言用戶',
    security: '安全',
    'security description': '服務器安全功能和反垃圾郵件保護',
  },
});

/**
 * Define information for each features
 *
 * There is an example:
 */
export const features: FeaturesConfig = {
  moderation: {
    name: <T text="moderation" />,
    description: <T text="moderation description" />,
    icon: <Icon as={MdSecurity} />,
    useRender(data) {
      return {
        serialize: () => '{}',
        component: <></>,
      };
    },
  },
  warnings: {
    name: <T text="warnings" />,
    description: <T text="warnings description" />,
    icon: <Icon as={IoWarning} w={5} h={5} />,
    useRender(data) {
      return {
        serialize: () => '{}',
        component: <></>,
      };
    },
  },
  'auto-mute': {
    name: <T text="auto mute" />,
    description: <T text="auto mute description" />,
    icon: <Icon as={FaBan} />,
    useRender(data) {
      return {
        serialize: () => '{}',
        component: <></>,
      };
    },
  },
  security: {
    name: <T text="security" />,
    description: <T text="security description" />,
    icon: <Icon as={BsShieldCheck} />,
    useRender(data) {
      return {
        serialize: () => '{}',
        component: <></>,
      };
    },
  },
};
