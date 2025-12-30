import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const formData = await request.formData()
    const memberId = formData.get('memberId') as string
    const imageUrl = formData.get('imageUrl') as string
    const type = formData.get('type') as string

    if (!memberId) {
        return new Response('Missing memberId', { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response('Unauthorized', { status: 401 })
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return new Response('Forbidden', { status: 403 })
    }

    if (type === 'profile') {
        // Delete profile image
        const { error } = await supabase
            .from('family_members')
            .update({ image_url: null })
            .eq('id', memberId)

        if (error) {
            return new Response(error.message, { status: 500 })
        }
    } else if (type === 'gallery' && imageUrl) {
        // Fetch current images
        const { data: member } = await supabase
            .from('family_members')
            .select('story_images')
            .eq('id', memberId)
            .single()

        if (member && Array.isArray(member.story_images)) {
            const updatedImages = member.story_images.filter((img: any) => {
                const url = typeof img === 'string' ? img : img.url
                return url !== imageUrl
            })

            const { error } = await supabase
                .from('family_members')
                .update({ story_images: updatedImages })
                .eq('id', memberId)

            if (error) {
                return new Response(error.message, { status: 500 })
            }
        }
    }

    revalidatePath(`/family/${memberId}`)
    return redirect(`/family/${memberId}`)
}
