import OrgPortal from "@/components/OrgPortal"

type Props = {
  params: Promise<{ org: string }>
}

export default async function TenantPage({ params }: Props) {
  const { org } = await params
  return <OrgPortal org={org} />
}