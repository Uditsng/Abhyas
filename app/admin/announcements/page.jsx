import CreateAnnouncement from '@/components/admin/CreateAnnouncement'
import AnnouncementList from '@/components/admin/AnnouncementList';

export default function AnnouncementPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <CreateAnnouncement />
      <AnnouncementList />
    </div>
  )
}
