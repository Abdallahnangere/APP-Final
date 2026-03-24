import { redirect } from 'next/navigation';
import { adminPortalUrl } from '@/lib/adminPortal';

export default function AdminElectricityPage() {
  redirect(adminPortalUrl('/?tab=electricity'));
}
