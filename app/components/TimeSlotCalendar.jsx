'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '@/lib/supabase';

export default function TimeSlotCalendar({ slotTitle, price, slotId, hostId }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 예약 가능한 시간대
  const availableTimes = [
    '09:00', '10:00', '11:00', 
    '14:00', '15:00', '16:00', '17:00',
    '19:00', '20:00'
  ];

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    // 로그인 확인
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('로그인이 필요합니다.');
      window.location.href = '/auth';
      return;
    }

    try {
  // 먼저 타임슬롯 정보를 가져와서 승인 필요 여부 확인
  const { data: timeslotData } = await supabase
    .from('timeslots')
    .select('requires_approval')
    .eq('id', slotId)
    .single();

  const requiresApproval = timeslotData?.requires_approval || false;
  
  // Supabase에 예약 저장
  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        timeslot_id: slotId,
        host_id: hostId,
        guest_id: user.id,
        booking_date: selectedDate.toISOString().split('T')[0],
        booking_time: selectedTime,
        status: requiresApproval ? 'pending' : 'confirmed',
        price: parseInt(price.replace(/[^0-9]/g, ''))
      }
    ]);

  if (error) throw error;

  const statusMessage = requiresApproval 
    ? '예약 신청이 완료되었습니다!\n호스트의 승인을 기다려주세요.' 
    : '예약이 확정되었습니다!';
  
  alert(`${statusMessage}\n날짜: ${selectedDate.toLocaleDateString('ko-KR')}\n시간: ${selectedTime}\n가격: ${price}`);

      if (error) throw error;

      alert(`예약 완료!\n날짜: ${selectedDate.toLocaleDateString('ko-KR')}\n시간: ${selectedTime}\n가격: ${price}`);
      setShowModal(false);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
  console.error('Booking error:', error);
  console.error('Error details:', error.details);
  console.error('Error hint:', error.hint);
  console.error('slotId:', slotId, 'hostId:', hostId);
  alert(`예약 실패: ${error.message || error.details || JSON.stringify(error)}`);
}
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        예약하기
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{slotTitle}</h3>
                <p className="text-purple-600 text-xl font-semibold mt-1">{price}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* 캘린더 */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">📅 날짜 선택</h4>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={new Date()}
                locale="ko-KR"
                className="border-none shadow-lg rounded-lg"
              />
            </div>

            {/* 시간 선택 */}
            {selectedDate && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">⏰ 시간 선택</h4>
                <div className="grid grid-cols-3 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`py-3 px-4 rounded-lg border-2 transition ${
                        selectedTime === time
                          ? 'border-purple-600 bg-purple-50 text-purple-600 font-semibold'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 예약 정보 요약 */}
            {selectedDate && selectedTime && (
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">📋 예약 정보</h4>
                <p className="text-gray-600">
                  날짜: {selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
                <p className="text-gray-600">시간: {selectedTime}</p>
                <p className="text-gray-600">금액: {price}</p>
              </div>
            )}

            {/* 예약 완료 버튼 */}
            <button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime}
              className={`w-full py-4 rounded-lg font-semibold transition ${
                selectedDate && selectedTime
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedDate && selectedTime ? '예약 확정하기' : '날짜와 시간을 선택해주세요'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}