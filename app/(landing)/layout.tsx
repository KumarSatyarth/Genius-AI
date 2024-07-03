const Landinglayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return ( 
        <main className="h-full bg-[#0c2026] overflow-auto">
            <div className="mx-auto max-w-screen-xl h-full w-full">
                {children}
            </div>
        </main>
     );
}
 
export default Landinglayout;  