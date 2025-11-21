import { getApperClient } from "@/services/apperClient";

export const attendanceService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('attendance_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching attendance:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('attendance_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance record ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByStudentId(studentId) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('attendance_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{
          "FieldName": "student_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(studentId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching attendance by student:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getByDate(date) {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('attendance_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{
          "FieldName": "date_c",
          "Operator": "StartsWith",
          "Values": [dateStr]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching attendance by date:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(attendanceData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: `${attendanceData.student_id_c} - ${attendanceData.date_c}`,
          student_id_c: parseInt(attendanceData.student_id_c),
          date_c: attendanceData.date_c,
          status_c: attendanceData.status_c,
          notes_c: attendanceData.notes_c || ""
        }]
      };

      const response = await apperClient.createRecord('attendance_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        return successful[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Error creating attendance:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, attendanceData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: `${attendanceData.student_id_c} - ${attendanceData.date_c}`,
          student_id_c: parseInt(attendanceData.student_id_c),
          date_c: attendanceData.date_c,
          status_c: attendanceData.status_c,
          notes_c: attendanceData.notes_c || ""
        }]
      };

      const response = await apperClient.updateRecord('attendance_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        return successful[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Error updating attendance:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async markAttendance(studentId, date, status, notes = "") {
    try {
      // Check if record already exists for this student and date
      const dateStr = date.toISOString().split('T')[0];
      const existingRecords = await this.getByDate(date);
      const existingRecord = existingRecords.find(a => 
        a.student_id_c?.Id === parseInt(studentId) && 
        a.date_c?.startsWith(dateStr)
      );

      if (existingRecord) {
        // Update existing record
        return await this.update(existingRecord.Id, {
          student_id_c: studentId,
          date_c: date.toISOString(),
          status_c: status,
          notes_c: notes
        });
      } else {
        // Create new record
        return await this.create({
          student_id_c: studentId,
          date_c: date.toISOString(),
          status_c: status,
          notes_c: notes
        });
      }
    } catch (error) {
      console.error("Error marking attendance:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async bulkMarkAttendance(studentIds, date, status) {
    try {
      const results = [];
      
      for (const studentId of studentIds) {
        try {
          const result = await this.markAttendance(studentId, date, status);
          results.push(result);
        } catch (error) {
          console.error(`Error marking attendance for student ${studentId}:`, error);
        }
      }
      
      return results;
    } catch (error) {
      console.error("Error bulk marking attendance:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('attendance_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting attendance:", error?.response?.data?.message || error);
      throw error;
    }
  }
};