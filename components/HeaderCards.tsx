function HeaderCards({ text1, text2 }: { text1: string; text2: string }) {
  return (
    <>
      <p
        data-aos="fade-down"
        data-aos-delay="50"
        className="font-bold text-neutral-600 dark:text-neutral-300 text-center leading-none mt-10"
      >
        {text1}
      </p>
      <h2
        data-aos="fade-up"
        data-aos-delay="50"
        className="text-2xl sm:text-3xl md:text-4xl uppercase font-black text-neutral-800 dark:text-neutral-50 text-center max-w-2xl mx-auto"
      >
        {text2}
      </h2>
      <p
        data-aos="fade-up"
        data-aos-delay="100"
        className="text-center font-bold text-amber-500 mb-5"
      >
        #Megaloblastos
      </p>
    </>
  );
}

export default HeaderCards;
