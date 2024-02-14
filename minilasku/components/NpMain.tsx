'use client'

export const NpMain = ({ title, navigation, children }: { title?: string; navigation?: React.ReactNode; children: React.ReactNode }) => {
	return (
		<main className='flex min-h-screen flex-col items-center justify-start  w-full'>
			{(navigation || title) && <NpNavigation title={title}>{navigation}</NpNavigation>}
			<NpContent>{children}</NpContent>
		</main>
	)
}

const NpNavigation = ({ title, children }: { title?: string; children: React.ReactNode }) => {
	return (
		<>
			<div className='absolute top-0 left-0 w-full h-10 bg-transparent bg-gradient-to-t from-transparent to-gray-300'></div>
			<div className='flex justify-between w-full items-center md:bg-transparent pl-2 md:pl-6 h-10'>
				{title && <div className='text-gray-500 ml-2'>{title}</div>}
			</div>
		</>
	)
}

const NpContent = ({ children }: { children: React.ReactNode }) => {
	return <div className='flex flex-col gap-4 w-full items-start pt-8 md:pt-20 px-2 md:px-8 '>{children}</div>
}
