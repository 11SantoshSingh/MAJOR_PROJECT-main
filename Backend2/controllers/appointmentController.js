const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, doctorSpecialty, notes } = req.body;

    if (!doctorId || !date || !time || !doctorSpecialty) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingAppointment = await Appointment.findOne({
      hospitalId: doctorId,
      date: date,
      time: time,
      doctorSpecialty: doctorSpecialty,
      status: { $in: ['confirmed', 'rescheduled', 'completed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({ 
        error: `This time slot is already booked for ${doctorSpecialty}. Please select another time.` 
      });
    }

    const appointment = new Appointment({
      patientId: req.user.userId,
      hospitalId: doctorId,
      date,
      time,
      doctorSpecialty,
      notes
    });

    await appointment.save();
    await appointment.populate('hospitalId', '-password');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.userId })
      .populate('hospitalId', '-password')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, appointments, count: appointments.length });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getHospitalAppointments = async (req, res) => {
  try {
    const hospitalId = req.user.userId;
    const appointments = await Appointment.find({ hospitalId: hospitalId })
      .populate('patientId', '-password')
      .populate('hospitalId', '-password')
      .sort({ date: -1, time: 1 });
    res.status(200).json({ success: true, appointments: appointments || [], count: appointments.length });
  } catch (error) {
    console.error('Get hospital appointments error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAppointmentsByHospitalAndDate = async (req, res) => {
  try {
    const { doctorId, date, specialty } = req.query;

    console.log('Availability check - doctorId:', doctorId);
    console.log('Availability check - date:', date);
    console.log('Availability check - specialty:', specialty);

    if (!doctorId || !date) {
      return res.status(400).json({ error: 'doctorId and date query parameters are required' });
    }

    let query = {
      hospitalId: doctorId,
      date: date,
      status: { $in: ['confirmed', 'rescheduled', 'completed'] }
    };
    
    if (specialty && specialty !== 'undefined' && specialty !== 'null' && specialty !== '') {
      query.doctorSpecialty = specialty;
    }

    const appointments = await Appointment.find(query)
      .select('time doctorSpecialty status')
      .sort({ time: 1 });

    res.status(200).json({ 
      success: true, 
      appointments: appointments || [], 
      count: appointments.length 
    });
  } catch (error) {
    console.error('Get appointments by date error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', '-password')
      .populate('hospitalId', '-password');
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(200).json({ success: true, appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized - You can only reschedule your own appointments' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot reschedule a completed appointment' });
    }
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot reschedule a cancelled appointment' });
    }

    const existingAppointment = await Appointment.findOne({
      hospitalId: appointment.hospitalId,
      date: date,
      time: time,
      doctorSpecialty: appointment.doctorSpecialty,
      status: { $in: ['confirmed', 'rescheduled', 'completed'] },
      _id: { $ne: appointment._id }
    });

    if (existingAppointment) {
      return res.status(409).json({ 
        error: `The selected time slot is already booked for ${appointment.doctorSpecialty}. Please choose another time.` 
      });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.status = 'rescheduled';
    appointment.updatedAt = new Date();

    await appointment.save();
    await appointment.populate('hospitalId', '-password');

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const isPatient = appointment.patientId.toString() === req.user.userId;
    const isHospital = appointment.hospitalId.toString() === req.user.userId;
    
    if (!isPatient && !isHospital) {
      return res.status(403).json({ error: 'Unauthorized - You can only cancel your own appointments' });
    }

    if (appointment.status === 'confirmed' || appointment.status === 'rescheduled') {
      await Appointment.deleteOne({ _id: req.params.id });
      return res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully'
      });
    } 
    else if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed appointment' });
    }
    else if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }
    else {
      return res.status(400).json({ error: `Cannot cancel appointment with status: ${appointment.status}` });
    }
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.hospitalId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized - Only the hospital can mark appointments as completed' });
    }

    if (appointment.status === 'confirmed' || appointment.status === 'rescheduled') {
      appointment.status = 'completed';
      appointment.updatedAt = new Date();
      await appointment.save();

      return res.status(200).json({
        success: true,
        message: 'Appointment marked as completed successfully',
        appointment
      });
    } 
    else {
      return res.status(400).json({ 
        error: `Cannot mark ${appointment.status} appointment as completed. Only confirmed or rescheduled appointments can be completed.` 
      });
    }
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ error: error.message });
  }
};